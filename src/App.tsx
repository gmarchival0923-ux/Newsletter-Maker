import React, { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  Mail, 
  FileText, 
  Layers, 
  Activity, 
  Image as ImageIcon, 
  Send, 
  RefreshCw, 
  Check, 
  Copy, 
  ExternalLink, 
  Eye, 
  Smartphone, 
  Monitor, 
  Download, 
  Award, 
  HelpCircle, 
  ListTodo, 
  Layout, 
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  Link as LinkIcon
} from "lucide-react";
import { NewsletterFields, AwardItem } from "./types";
import { defaultNewsletterFields } from "./defaultData";
import { renderModernHTML, renderLegacyHTML } from "./templateRenderer";

export default function App() {
  const [fields, setFields] = useState<NewsletterFields>(defaultNewsletterFields);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [openSection, setOpenSection] = useState<string>("header");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<{
    success: boolean;
    filename: string;
    path: string;
    htmlContent: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const editorParagraphsRef = useRef<HTMLTextAreaElement>(null);
  const hotTakesParagraphsRef = useRef<HTMLTextAreaElement>(null);
  const leadStoryParagraphsRef = useRef<HTMLTextAreaElement>(null);

  const [linkUrl, setLinkUrl] = useState("");
  const [linkPrompt, setLinkPrompt] = useState<{
    activeField: "editorParagraphs" | "hotTakesParagraphs" | "leadStoryParagraphs";
    selectedText: string;
    selectionStart: number;
    selectionEnd: number;
  } | null>(null);

  const handleOpenLinkPrompt = (
    fieldKey: "editorParagraphs" | "hotTakesParagraphs" | "leadStoryParagraphs",
    ref: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const val = textarea.value || "";
    const selectedText = val.substring(start, end);

    setLinkPrompt({
      activeField: fieldKey,
      selectedText,
      selectionStart: start,
      selectionEnd: end
    });
    setLinkUrl("");
  };

  const insertLink = (fieldKey: "editorParagraphs" | "hotTakesParagraphs" | "leadStoryParagraphs") => {
    if (!linkPrompt) return;
    let url = linkUrl.trim();
    if (url && !/^https?:\/\//i.test(url) && !url.startsWith("#") && !url.startsWith("mailto:")) {
      url = "https://" + url;
    }
    const text = linkPrompt.selectedText || "Link";
    const linkHtml = `<a href="${url || '#'}" target="_blank" style="color: #2563eb; text-decoration: underline;">${text}</a>`;
    const currentValue = fields[fieldKey] || "";
    const start = linkPrompt.selectionStart;
    const end = linkPrompt.selectionEnd;
    const newValue = currentValue.substring(0, start) + linkHtml + currentValue.substring(end);

    setFields(prev => ({
      ...prev,
      [fieldKey]: newValue
    }));
    setLinkPrompt(null);
    setLinkUrl("");

    const textareaRef = fieldKey === "editorParagraphs" 
      ? editorParagraphsRef 
      : fieldKey === "hotTakesParagraphs" 
      ? hotTakesParagraphsRef 
      : leadStoryParagraphsRef;

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = start + linkHtml.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  // Auto-generate safe filename from the date field
  const getSafeFilename = (dateStr: string) => {
    const sanitized = dateStr
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove punctuation
      .replace(/\s+/g, "-"); // spaces to hyphens
    return `newsletter-${sanitized || "draft"}.html`;
  };

  const currentFilename = getSafeFilename(fields.dateText);

  // Compile active template (always use modern card)
  const compiledHTML = renderModernHTML(fields);

  // Handle single input field changes
  const handleChange = (key: keyof NewsletterFields, value: any) => {
    setFields(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle nested Awards change
  const handleAwardChange = (index: number, key: keyof AwardItem, value: string) => {
    const updatedAwards = [...fields.awardsList];
    updatedAwards[index] = {
      ...updatedAwards[index],
      [key]: value
    };
    handleChange("awardsList", updatedAwards);
  };

  // Add award nomination
  const handleAddAward = () => {
    const updatedAwards = [...fields.awardsList, {
      name: "New Award Opportunity",
      deadline: "Deadline: Month Day",
      buttonText: "APPLY NOW »",
      buttonUrl: "https://web.hr.com"
    }];
    handleChange("awardsList", updatedAwards);
  };

  // Delete award nomination
  const handleDeleteAward = (index: number) => {
    const updatedAwards = fields.awardsList.filter((_, i) => i !== index);
    handleChange("awardsList", updatedAwards);
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore the default newsletter sample data? Any unsaved edits will be lost.")) {
      setFields(defaultNewsletterFields);
      setStatusMessage({ type: "success", text: "Successfully restored default sample data!" });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Clear all fields
  const handleClear = () => {
    if (window.confirm("Clear all field values to start a fresh draft?")) {
      const cleared: NewsletterFields = {
        theme: "modern",
        signupText: "",
        signupUrl: "",
        headerTitle: "",
        headerSubtitle: "",
        headerImg: "",
        headerImgAlt: "",
        dateText: "month dd, yyyy",
        editorSalutation: "Dear __FIRST_NAME__,",
        editorParagraphs: "",
        topAdImg: "",
        topAdUrl: "",
        topAdAlt: "",
        leadTitleLabel: "Lead Story",
        leadImg: "",
        leadStoryTitle: "",
        leadStoryAuthor: "",
        leadStoryParagraphs: "",
        leadStoryButtonText: "READ ARTICLE →",
        leadStoryButtonUrl: "",
        hotTakesTitleLabel: "Hot Marketing Takes",
        hotTakesImg: "",
        hotTakesParagraphs: "",
        podcastLabel: "Podcast Spotlight",
        podcastTitle: "",
        podcastImg: "",
        podcastContent: "",
        podcastButtonText: "WATCH NOW ▶",
        podcastButtonUrl: "",
        marketingWebcastLabel: "Marketing Webcast",
        marketingWebcastTitle: "",
        marketingWebcastImg: "",
        marketingWebcastContent: "",
        marketingWebcastButtonText: "VIEW NOW ▶",
        marketingWebcastButtonUrl: "",
        hrWebcastLabel: "HR Webcast",
        hrWebcastTitle: "",
        hrWebcastImg: "",
        hrWebcastContent: "",
        hrWebcastButtonText: "WATCH NOW ▶",
        hrWebcastButtonUrl: "",
        researchLabel: "Featured HR Research",
        researchTitle: "",
        researchImg: "",
        researchContent: "",
        researchButtonText: "DOWNLOAD REPORT →",
        researchButtonUrl: "",
        winnersLabel: "Award Winners",
        winnersTitle: "",
        winnersImg: "",
        winnersContent: "",
        winnersButtonText: "SEE WINNERS »",
        winnersButtonUrl: "",
        awardsLabel: "HR.com Awards",
        awardsSectionTitle: "Nominate Your Solution for an HR.com Award:",
        awardsList: [],
        bottomAdImg: "",
        bottomAdUrl: "",
        bottomAdAlt: "",
        pollTitle: "Poll Of The Week",
        pollQuestion: "",
        pollChoice1: "",
        pollChoice1Url: "",
        pollChoice2: "",
        pollChoice2Url: "",
        pollChoice3: "",
        pollChoice3Url: "",
        pollChoice4: "",
        pollChoice4Url: "",
        forwardTextContent: "",
        footerFacebookUrl: "",
        footerLinkedinUrl: "",
        footerInstagramUrl: "",
        footerYoutubeUrl: "",
        footerTwitterUrl: "",
        footerClosingText: "",
        footerSubscribeText: "SUBSCRIBE TO OUR OTHER NEWSLETTERS",
        footerSubscribeUrl: "",
        footerUnsubscribeUrl: "",
        footerManageSubscriptionUrl: "",
        footerAdvertiseUrl: "",
        footerPrivacyPolicyUrl: "",
        footerContactUsUrl: "",
        footerCopyrightText: "",
        footerDisclaimerText: ""
      };
      setFields(cleared);
      setStatusMessage({ type: "success", text: "Cleared fields!" });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Copy to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(compiledHTML);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Save the compiled newsletter on the filesystem
  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/save-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: currentFilename,
          htmlContent: compiledHTML
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setGenerationResult({
          success: true,
          filename: data.filename,
          path: data.path,
          htmlContent: compiledHTML
        });
        setStatusMessage({ type: "success", text: `Saved file: ${data.filename}` });
      } else {
        throw new Error(data.error || "Failed to generate newsletter");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to communicate with server." });
    } finally {
      setIsGenerating(false);
    }
  };

  // Browser download helper
  const triggerBrowserDownload = () => {
    const blob = new Blob([compiledHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Accordion Toggle
  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? "" : section);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* HEADER BAR */}
      <header className="bg-[#0A0A0A] border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
            <div className="w-4 h-4 bg-black"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl tracking-tighter uppercase italic text-white font-sans">NEWSLETTER BUILDER</h1>
            </div>
          </div>
        </div>


      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDE: INPUT FORM WITH FIELDS */}
        <div className="w-[45%] border-r border-white/10 bg-[#111111] flex flex-col overflow-y-auto">
          
          {/* Quick Config Segment */}
          <div className="p-8 border-b border-white/10 bg-transparent">
            <div className="flex flex-col gap-2">
              <label className="block text-[10px] font-black tracking-widest text-white/40 uppercase">Date Text Field</label>
              <div className="flex gap-3">
                <input 
                  type="text"
                  value={fields.dateText}
                  onChange={(e) => handleChange("dateText", e.target.value)}
                  className="flex-1 bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors font-mono rounded-none"
                  placeholder="e.g., June 22, 2026"
                />
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                    handleChange("dateText", today.toLocaleDateString('en-US', options));
                  }}
                  className="bg-white/5 hover:bg-white/15 text-white border border-white/20 hover:border-white px-4 py-2 rounded-none text-xs font-black uppercase tracking-wider transition-all"
                >
                  Set Today
                </button>
              </div>
              <p className="text-[10px] text-white/40 italic mt-1">Filename: <strong className="text-white/80 font-mono">{currentFilename}</strong></p>
            </div>
          </div>

          {/* DYNAMIC FORM COLLAPSABLES */}
          <div className="flex-1 p-8 space-y-6">
            
            {/* 1. HEADER SECTION */}
            <div className="border border-white/10 rounded-none overflow-hidden bg-[#161616]">
              <button 
                type="button"
                onClick={() => toggleSection("header")}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#1A1A1A] hover:bg-[#222] transition-colors border-b border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-white/60" />
                  <span className="font-black text-xs tracking-widest uppercase text-white">Header Settings</span>
                </div>
                <span className="text-white/40 text-xs font-mono">{openSection === "header" ? "▼" : "▶"}</span>
              </button>
              
              {openSection === "header" && (
                <div className="p-6 space-y-5 border-t border-white/10 bg-[#111111]/60">
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Main Title Text</label>
                    <input 
                      type="text"
                      value={fields.headerTitle}
                      onChange={(e) => handleChange("headerTitle", e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Subtitle Slogan Text</label>
                    <textarea 
                      value={fields.headerSubtitle}
                      onChange={(e) => handleChange("headerSubtitle", e.target.value)}
                      rows={2}
                      className="w-full bg-transparent border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Header Image URL</label>
                    <input 
                      type="text"
                      value={fields.headerImg}
                      onChange={(e) => handleChange("headerImg", e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none font-mono"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Header Image Alt Text</label>
                    <input 
                      type="text"
                      value={fields.headerImgAlt}
                      onChange={(e) => handleChange("headerImgAlt", e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Signup Button Text</label>
                      <input 
                        type="text"
                        value={fields.signupText}
                        onChange={(e) => handleChange("signupText", e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Signup Button Link</label>
                      <input 
                        type="text"
                        value={fields.signupUrl}
                        onChange={(e) => handleChange("signupUrl", e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. EDITOR'S NOTE SECTION */}
            <div className="border border-white/10 rounded-none overflow-hidden bg-[#161616]">
              <button 
                type="button"
                onClick={() => toggleSection("editor")}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#1A1A1A] hover:bg-[#222] transition-colors border-b border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-white/60" />
                  <span className="font-black text-xs tracking-widest uppercase text-white">Editor's Note</span>
                </div>
                <span className="text-white/40 text-xs font-mono">{openSection === "editor" ? "▼" : "▶"}</span>
              </button>
              
              {openSection === "editor" && (
                <div className="p-6 space-y-5 border-t border-white/10 bg-[#111111]/60">
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Salutation Greeting</label>
                    <input 
                      type="text"
                      value={fields.editorSalutation}
                      onChange={(e) => handleChange("editorSalutation", e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                    />
                  </div>
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <label className="block text-[10px] font-black tracking-widest text-white/40 uppercase">Letter Body Paragraphs</label>
                        <button
                          type="button"
                          onClick={() => handleOpenLinkPrompt("editorParagraphs", editorParagraphsRef)}
                          className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-white/10 rounded-none bg-black/20 cursor-pointer"
                          title="Make highlighted text into a link"
                        >
                          <LinkIcon className="w-2.5 h-2.5" />
                          <span>Add Link</span>
                        </button>
                      </div>
                      <span className="text-[9px] text-white/30 italic font-medium">Empty line separates paragraphs</span>
                    </div>
                    <textarea 
                      ref={editorParagraphsRef}
                      value={fields.editorParagraphs}
                      onChange={(e) => handleChange("editorParagraphs", e.target.value)}
                      rows={6}
                      className="w-full bg-transparent border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white transition-colors font-mono rounded-none"
                      placeholder="Write letter text content..."
                    />
                    {linkPrompt && linkPrompt.activeField === "editorParagraphs" && (
                      <div className="bg-[#1A1A1A] border border-white/10 p-3 space-y-3 mt-2 rounded-none">
                        <div className="text-[10px] font-black tracking-widest text-white/50 uppercase">Insert Hyperlink</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-white/40 uppercase mb-1">Link Text</label>
                            <input
                              type="text"
                              value={linkPrompt.selectedText}
                              onChange={(e) => setLinkPrompt(prev => prev ? { ...prev, selectedText: e.target.value } : null)}
                              className="w-full bg-black/40 border border-white/10 p-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none"
                              placeholder="e.g. Click Here"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-white/40 uppercase mb-1">URL</label>
                            <input
                              type="text"
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 p-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none"
                              placeholder="https://example.com"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              setLinkPrompt(null);
                              setLinkUrl("");
                            }}
                            className="px-2.5 py-1 text-white/60 hover:text-white hover:bg-white/5 border border-transparent transition-colors uppercase font-mono cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => insertLink("editorParagraphs")}
                            className="px-2.5 py-1 bg-white text-black hover:bg-white/90 font-bold transition-colors uppercase font-mono cursor-pointer"
                          >
                            Insert
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <span className="block text-[10px] font-black tracking-widest uppercase text-white/80">Top Sponsor Ad (300x250)</span>
                    <div className="group">
                      <label className="block text-[9px] font-black tracking-wider text-white/40 mb-1.5 uppercase">Ad Image URL</label>
                      <input 
                        type="text"
                        value={fields.topAdImg}
                        onChange={(e) => handleChange("topAdImg", e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-1 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black tracking-wider text-white/40 mb-1.5 uppercase">Ad Target Link</label>
                      <input 
                        type="text"
                        value={fields.topAdUrl}
                        onChange={(e) => handleChange("topAdUrl", e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-1 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black tracking-wider text-white/40 mb-1.5 uppercase">Ad Alternative Text</label>
                      <input 
                        type="text"
                        value={fields.topAdAlt}
                        onChange={(e) => handleChange("topAdAlt", e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-1 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. LEAD STORY SECTION */}
            <div className="border border-white/10 rounded-none overflow-hidden bg-[#161616]">
              <button 
                type="button"
                onClick={() => toggleSection("leadStory")}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#1A1A1A] hover:bg-[#222] transition-colors border-b border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-white/60" />
                  <span className="font-black text-xs tracking-widest uppercase text-white">Lead Story Setup</span>
                </div>
                <span className="text-white/40 text-xs font-mono">{openSection === "leadStory" ? "▼" : "▶"}</span>
              </button>
              
              {openSection === "leadStory" && (
                <div className="p-6 space-y-5 border-t border-white/10 bg-[#111111]/60">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Badge Label</label>
                      <input 
                        type="text"
                        value={fields.leadTitleLabel}
                        onChange={(e) => handleChange("leadTitleLabel", e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Cover Image URL</label>
                      <input 
                        type="text"
                        value={fields.leadImg}
                        onChange={(e) => handleChange("leadImg", e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Headline Title</label>
                    <input 
                      type="text"
                      value={fields.leadStoryTitle}
                      onChange={(e) => handleChange("leadStoryTitle", e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Story Author</label>
                    <input 
                      type="text"
                      value={fields.leadStoryAuthor}
                      onChange={(e) => handleChange("leadStoryAuthor", e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                    />
                  </div>
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <label className="block text-[10px] font-black tracking-widest text-white/40 uppercase">Lead Article Body</label>
                        <button
                          type="button"
                          onClick={() => handleOpenLinkPrompt("leadStoryParagraphs", leadStoryParagraphsRef)}
                          className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-white/10 rounded-none bg-black/20 cursor-pointer"
                          title="Make highlighted text into a link"
                        >
                          <LinkIcon className="w-2.5 h-2.5" />
                          <span>Add Link</span>
                        </button>
                      </div>
                    </div>
                    <textarea 
                      ref={leadStoryParagraphsRef}
                      value={fields.leadStoryParagraphs}
                      onChange={(e) => handleChange("leadStoryParagraphs", e.target.value)}
                      rows={5}
                      className="w-full bg-transparent border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white transition-colors font-mono rounded-none"
                      placeholder="Write lead story content..."
                    />
                    {linkPrompt && linkPrompt.activeField === "leadStoryParagraphs" && (
                      <div className="bg-[#1A1A1A] border border-white/10 p-3 space-y-3 mt-2 rounded-none">
                        <div className="text-[10px] font-black tracking-widest text-white/50 uppercase">Insert Hyperlink</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-white/40 uppercase mb-1">Link Text</label>
                            <input
                              type="text"
                              value={linkPrompt.selectedText}
                              onChange={(e) => setLinkPrompt(prev => prev ? { ...prev, selectedText: e.target.value } : null)}
                              className="w-full bg-black/40 border border-white/10 p-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none"
                              placeholder="e.g. Click Here"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-white/40 uppercase mb-1">URL</label>
                            <input
                              type="text"
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 p-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none"
                              placeholder="https://example.com"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              setLinkPrompt(null);
                              setLinkUrl("");
                            }}
                            className="px-2.5 py-1 text-white/60 hover:text-white hover:bg-white/5 border border-transparent transition-colors uppercase font-mono cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => insertLink("leadStoryParagraphs")}
                            className="px-2.5 py-1 bg-white text-black hover:bg-white/90 font-bold transition-colors uppercase font-mono cursor-pointer"
                          >
                            Insert
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Button CTA Text</label>
                      <input 
                        type="text"
                        value={fields.leadStoryButtonText}
                        onChange={(e) => handleChange("leadStoryButtonText", e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Button target link</label>
                      <input 
                        type="text"
                        value={fields.leadStoryButtonUrl}
                        onChange={(e) => handleChange("leadStoryButtonUrl", e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. HOT TAKES SECTION */}
            <div className="border border-white/10 rounded-none overflow-hidden bg-[#161616]">
              <button 
                type="button"
                onClick={() => toggleSection("hotTakes")}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#1A1A1A] hover:bg-[#222] transition-colors border-b border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-white/60" />
                  <span className="font-black text-xs tracking-widest uppercase text-white">Hot Marketing Takes</span>
                </div>
                <span className="text-white/40 text-xs font-mono">{openSection === "hotTakes" ? "▼" : "▶"}</span>
              </button>
              
              {openSection === "hotTakes" && (
                <div className="p-6 space-y-5 border-t border-white/10 bg-[#111111]/60">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Section Label</label>
                      <input 
                        type="text"
                        value={fields.hotTakesTitleLabel}
                        onChange={(e) => handleChange("hotTakesTitleLabel", e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-white/40 mb-2 uppercase">Header Cover Image</label>
                      <input 
                        type="text"
                        value={fields.hotTakesImg}
                        onChange={(e) => handleChange("hotTakesImg", e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors rounded-none"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <label className="block text-[10px] font-black tracking-widest text-white/40 uppercase">Takes Content Paragraphs</label>
                        <button
                          type="button"
                          onClick={() => handleOpenLinkPrompt("hotTakesParagraphs", hotTakesParagraphsRef)}
                          className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-white/10 rounded-none bg-black/20 cursor-pointer"
                          title="Make highlighted text into a link"
                        >
                          <LinkIcon className="w-2.5 h-2.5" />
                          <span>Add Link</span>
                        </button>
                      </div>
                    </div>
                    <textarea 
                      ref={hotTakesParagraphsRef}
                      value={fields.hotTakesParagraphs}
                      onChange={(e) => handleChange("hotTakesParagraphs", e.target.value)}
                      rows={6}
                      className="w-full bg-transparent border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-white transition-colors font-mono rounded-none"
                      placeholder="Write marketing takes content..."
                    />
                    {linkPrompt && linkPrompt.activeField === "hotTakesParagraphs" && (
                      <div className="bg-[#1A1A1A] border border-white/10 p-3 space-y-3 mt-2 rounded-none">
                        <div className="text-[10px] font-black tracking-widest text-white/50 uppercase">Insert Hyperlink</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-white/40 uppercase mb-1">Link Text</label>
                            <input
                              type="text"
                              value={linkPrompt.selectedText}
                              onChange={(e) => setLinkPrompt(prev => prev ? { ...prev, selectedText: e.target.value } : null)}
                              className="w-full bg-black/40 border border-white/10 p-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none"
                              placeholder="e.g. Click Here"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-white/40 uppercase mb-1">URL</label>
                            <input
                              type="text"
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 p-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none"
                              placeholder="https://example.com"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              setLinkPrompt(null);
                              setLinkUrl("");
                            }}
                            className="px-2.5 py-1 text-white/60 hover:text-white hover:bg-white/5 border border-transparent transition-colors uppercase font-mono cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => insertLink("hotTakesParagraphs")}
                            className="px-2.5 py-1 bg-white text-black hover:bg-white/90 font-bold transition-colors uppercase font-mono cursor-pointer"
                          >
                            Insert
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 5. SPOTLIGHT COLUMNS SECTION */}
            <div className="border border-white/10 rounded-none overflow-hidden bg-[#161616]">
              <button 
                type="button"
                onClick={() => toggleSection("columns")}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#1A1A1A] hover:bg-[#222] transition-colors border-b border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <Layout className="w-4 h-4 text-white/60" />
                  <span className="font-black text-xs tracking-widest uppercase text-white">Feature Spotlight Cards</span>
                </div>
                <span className="text-white/40 text-xs font-mono">{openSection === "columns" ? "▼" : "▶"}</span>
              </button>
              
              {openSection === "columns" && (
                <div className="p-6 space-y-6 border-t border-white/10 bg-[#111111]/60 max-h-[500px] overflow-y-auto">
                  
                  {/* Card 1: Podcast Spotlight */}
                  <div className="bg-transparent p-5 rounded-none border border-white/10 space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">1. Podcast Spotlight</span>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Card Label / Badge</label>
                      <input type="text" value={fields.podcastLabel} onChange={(e) => handleChange("podcastLabel", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Title</label>
                      <input type="text" value={fields.podcastTitle} onChange={(e) => handleChange("podcastTitle", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Image URL</label>
                        <input type="text" value={fields.podcastImg} onChange={(e) => handleChange("podcastImg", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Button Link</label>
                        <input type="text" value={fields.podcastButtonUrl} onChange={(e) => handleChange("podcastButtonUrl", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Description Content</label>
                      <textarea value={fields.podcastContent} onChange={(e) => handleChange("podcastContent", e.target.value)} rows={2} className="w-full bg-transparent border border-white/10 p-2 text-xs font-mono text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                  </div>

                  {/* Card 2: Marketing Webcast */}
                  <div className="bg-transparent p-5 rounded-none border border-white/10 space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">2. Marketing Webcast</span>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Card Label / Badge</label>
                      <input type="text" value={fields.marketingWebcastLabel} onChange={(e) => handleChange("marketingWebcastLabel", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Title</label>
                      <input type="text" value={fields.marketingWebcastTitle} onChange={(e) => handleChange("marketingWebcastTitle", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Image URL</label>
                        <input type="text" value={fields.marketingWebcastImg} onChange={(e) => handleChange("marketingWebcastImg", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Button Link</label>
                        <input type="text" value={fields.marketingWebcastButtonUrl} onChange={(e) => handleChange("marketingWebcastButtonUrl", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Description Content</label>
                      <textarea value={fields.marketingWebcastContent} onChange={(e) => handleChange("marketingWebcastContent", e.target.value)} rows={2} className="w-full bg-transparent border border-white/10 p-2 text-xs font-mono text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                  </div>

                  {/* Card 3: HR Webcast */}
                  <div className="bg-transparent p-5 rounded-none border border-white/10 space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">3. HR Webcast</span>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Card Label / Badge</label>
                      <input type="text" value={fields.hrWebcastLabel} onChange={(e) => handleChange("hrWebcastLabel", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Title</label>
                      <input type="text" value={fields.hrWebcastTitle} onChange={(e) => handleChange("hrWebcastTitle", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Image URL</label>
                        <input type="text" value={fields.hrWebcastImg} onChange={(e) => handleChange("hrWebcastImg", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Button Link</label>
                        <input type="text" value={fields.hrWebcastButtonUrl} onChange={(e) => handleChange("hrWebcastButtonUrl", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Description Content</label>
                      <textarea value={fields.hrWebcastContent} onChange={(e) => handleChange("hrWebcastContent", e.target.value)} rows={2} className="w-full bg-transparent border border-white/10 p-2 text-xs font-mono text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                  </div>

                  {/* Card 4: Featured Research */}
                  <div className="bg-transparent p-5 rounded-none border border-white/10 space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">4. Featured HR Research</span>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Card Label / Badge</label>
                      <input type="text" value={fields.researchLabel} onChange={(e) => handleChange("researchLabel", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Title</label>
                      <input type="text" value={fields.researchTitle} onChange={(e) => handleChange("researchTitle", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Image URL</label>
                        <input type="text" value={fields.researchImg} onChange={(e) => handleChange("researchImg", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Button Link</label>
                        <input type="text" value={fields.researchButtonUrl} onChange={(e) => handleChange("researchButtonUrl", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Description Content</label>
                      <textarea value={fields.researchContent} onChange={(e) => handleChange("researchContent", e.target.value)} rows={2} className="w-full bg-transparent border border-white/10 p-2 text-xs font-mono text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                  </div>

                  {/* Card 5: Award Winners */}
                  <div className="bg-transparent p-5 rounded-none border border-white/10 space-y-3.5">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">5. HR.com Award Winners</span>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Card Label / Badge</label>
                      <input type="text" value={fields.winnersLabel} onChange={(e) => handleChange("winnersLabel", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Title</label>
                      <input type="text" value={fields.winnersTitle} onChange={(e) => handleChange("winnersTitle", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Image URL</label>
                        <input type="text" value={fields.winnersImg} onChange={(e) => handleChange("winnersImg", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Button Link</label>
                        <input type="text" value={fields.winnersButtonUrl} onChange={(e) => handleChange("winnersButtonUrl", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Description Content</label>
                      <textarea value={fields.winnersContent} onChange={(e) => handleChange("winnersContent", e.target.value)} rows={2} className="w-full bg-transparent border border-white/10 p-2 text-xs font-mono text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                  </div>

                  {/* Card 6: Awards Program Nominations */}
                  <div className="bg-transparent p-5 rounded-none border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-white/60" />
                        <span className="text-[10px] font-black uppercase text-white tracking-widest">6. Nominations List</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAddAward}
                        className="flex items-center gap-1.5 bg-white hover:bg-white/95 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-none transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Award
                      </button>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1">Card Label / Badge</label>
                      <input type="text" value={fields.awardsLabel} onChange={(e) => handleChange("awardsLabel", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-white/40 uppercase mb-1.5">Awards Section Heading</label>
                      <input type="text" value={fields.awardsSectionTitle} onChange={(e) => handleChange("awardsSectionTitle", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    
                    {fields.awardsList.map((award, i) => (
                      <div key={i} className="bg-[#1A1A1A] p-4 rounded-none border border-white/10 relative space-y-3 mt-3">
                        <button 
                          type="button" 
                          onClick={() => handleDeleteAward(i)}
                          className="absolute top-2 right-2.5 text-white/40 hover:text-red-400 p-0.5 text-lg font-black transition-colors"
                          title="Delete nomination item"
                        >
                          &times;
                        </button>
                        <span className="text-[9px] font-black font-mono tracking-wider text-white/50">NOMINATION ITEM #{i+1}</span>
                        <div className="group">
                          <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Award Title Name</label>
                          <input type="text" value={award.name} onChange={(e) => handleAwardChange(i, "name", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="group">
                            <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Deadline text</label>
                            <input type="text" value={award.deadline} onChange={(e) => handleAwardChange(i, "deadline", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                          </div>
                          <div className="group">
                            <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Apply Link</label>
                            <input type="text" value={award.buttonUrl} onChange={(e) => handleAwardChange(i, "buttonUrl", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                          </div>
                          <div className="group">
                            <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Image URL</label>
                            <input type="text" value={award.imageUrl || ""} onChange={(e) => handleAwardChange(i, "imageUrl", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" placeholder="https://..." />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>

            {/* 6. BOTTOM AD & POLL SECTION */}
            <div className="border border-white/10 rounded-none overflow-hidden bg-[#161616]">
              <button 
                type="button"
                onClick={() => toggleSection("poll")}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#1A1A1A] hover:bg-[#222] transition-colors border-b border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-white/60" />
                  <span className="font-black text-xs tracking-widest uppercase text-white">Interactive Poll & Ads</span>
                </div>
                <span className="text-white/40 text-xs font-mono">{openSection === "poll" ? "▼" : "▶"}</span>
              </button>
              
              {openSection === "poll" && (
                <div className="p-6 space-y-6 border-t border-white/10 bg-[#111111]/60 max-h-[450px] overflow-y-auto">
                  <div className="space-y-4 border-b border-white/10 pb-5">
                    <span className="block text-[10px] font-black text-white/80 uppercase tracking-widest">Bottom Sponsor Ad (300x250)</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Ad Image URL</label>
                        <input type="text" value={fields.bottomAdImg} onChange={(e) => handleChange("bottomAdImg", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                      <div className="group">
                        <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Ad Target Link</label>
                        <input type="text" value={fields.bottomAdUrl} onChange={(e) => handleChange("bottomAdUrl", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Ad Alternative Alt Text</label>
                      <input type="text" value={fields.bottomAdAlt} onChange={(e) => handleChange("bottomAdAlt", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="block text-[10px] font-black text-white/80 uppercase tracking-widest">Weekly Interactive Poll</span>
                    <div className="group">
                      <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Poll Title Label</label>
                      <input type="text" value={fields.pollTitle} onChange={(e) => handleChange("pollTitle", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="group">
                      <label className="block text-[8px] font-black text-white/40 uppercase mb-1">Question Text</label>
                      <input type="text" value={fields.pollQuestion} onChange={(e) => handleChange("pollQuestion", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1.5 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>

                    {/* Poll Option 1 */}
                    <div className="bg-[#1A1A1A] p-3 rounded-none border border-white/10 space-y-2">
                      <label className="block text-[8px] font-black text-white/40 uppercase">Choice Option 1</label>
                      <input type="text" value={fields.pollChoice1} onChange={(e) => handleChange("pollChoice1", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" placeholder="Choice option..." />
                      <input type="text" value={fields.pollChoice1Url} onChange={(e) => handleChange("pollChoice1Url", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-[10px] text-white/60 focus:outline-none focus:border-white rounded-none font-mono" placeholder="Target Link (e.g., Google Form URL)..." />
                    </div>

                    {/* Poll Option 2 */}
                    <div className="bg-[#1A1A1A] p-3 rounded-none border border-white/10 space-y-2">
                      <label className="block text-[8px] font-black text-white/40 uppercase">Choice Option 2</label>
                      <input type="text" value={fields.pollChoice2} onChange={(e) => handleChange("pollChoice2", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" placeholder="Choice option..." />
                      <input type="text" value={fields.pollChoice2Url} onChange={(e) => handleChange("pollChoice2Url", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-[10px] text-white/60 focus:outline-none focus:border-white rounded-none font-mono" placeholder="Target Link..." />
                    </div>

                    {/* Poll Option 3 */}
                    <div className="bg-[#1A1A1A] p-3 rounded-none border border-white/10 space-y-2">
                      <label className="block text-[8px] font-black text-white/40 uppercase">Choice Option 3</label>
                      <input type="text" value={fields.pollChoice3} onChange={(e) => handleChange("pollChoice3", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" placeholder="Choice option..." />
                      <input type="text" value={fields.pollChoice3Url} onChange={(e) => handleChange("pollChoice3Url", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-[10px] text-white/60 focus:outline-none focus:border-white rounded-none font-mono" placeholder="Target Link..." />
                    </div>

                    {/* Poll Option 4 */}
                    <div className="bg-[#1A1A1A] p-3 rounded-none border border-white/10 space-y-2">
                      <label className="block text-[8px] font-black text-white/40 uppercase">Choice Option 4</label>
                      <input type="text" value={fields.pollChoice4} onChange={(e) => handleChange("pollChoice4", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" placeholder="Choice option..." />
                      <input type="text" value={fields.pollChoice4Url} onChange={(e) => handleChange("pollChoice4Url", e.target.value)} className="w-full bg-transparent border-b border-white/10 pb-1 text-[10px] text-white/60 focus:outline-none focus:border-white rounded-none font-mono" placeholder="Target Link..." />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 7. FOOTER SECTION */}
            <div className="border border-white/10 rounded-none overflow-hidden bg-[#161616]">
              <button 
                type="button"
                onClick={() => toggleSection("footer")}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#1A1A1A] hover:bg-[#222] transition-colors border-b border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <ListTodo className="w-4 h-4 text-white/60" />
                  <span className="font-black text-xs tracking-widest uppercase text-white">Footer & Socials</span>
                </div>
                <span className="text-white/40 text-xs font-mono">{openSection === "footer" ? "▼" : "▶"}</span>
              </button>
              
              {openSection === "footer" && (
                <div className="p-6 space-y-5 border-t border-white/10 bg-[#111111]/60 max-h-[400px] overflow-y-auto">
                  <div className="group">
                    <label className="block text-[10px] font-black text-white/40 uppercase mb-2">Social Media URLs</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={fields.footerFacebookUrl} onChange={(e) => handleChange("footerFacebookUrl", e.target.value)} className="bg-transparent border-b border-white/20 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" placeholder="Facebook" />
                      <input type="text" value={fields.footerLinkedinUrl} onChange={(e) => handleChange("footerLinkedinUrl", e.target.value)} className="bg-transparent border-b border-white/20 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" placeholder="LinkedIn" />
                      <input type="text" value={fields.footerInstagramUrl} onChange={(e) => handleChange("footerInstagramUrl", e.target.value)} className="bg-transparent border-b border-white/20 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" placeholder="Instagram" />
                      <input type="text" value={fields.footerYoutubeUrl} onChange={(e) => handleChange("footerYoutubeUrl", e.target.value)} className="bg-transparent border-b border-white/20 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" placeholder="YouTube" />
                      <input type="text" value={fields.footerTwitterUrl} onChange={(e) => handleChange("footerTwitterUrl", e.target.value)} className="bg-transparent border-b border-white/20 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" placeholder="X (Twitter)" />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-[10px] font-black text-white/40 uppercase mb-2">Footer Closing Text</label>
                    <textarea value={fields.footerClosingText} onChange={(e) => handleChange("footerClosingText", e.target.value)} rows={3} className="w-full bg-transparent border border-white/10 p-2 text-xs text-white focus:outline-none focus:border-white font-mono rounded-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[10px] font-black text-white/40 uppercase mb-2">Subscribe Button Text</label>
                      <input type="text" value={fields.footerSubscribeText} onChange={(e) => handleChange("footerSubscribeText", e.target.value)} className="w-full bg-transparent border-b border-white/20 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black text-white/40 uppercase mb-2">Subscribe Link</label>
                      <input type="text" value={fields.footerSubscribeUrl} onChange={(e) => handleChange("footerSubscribeUrl", e.target.value)} className="w-full bg-transparent border-b border-white/20 pb-1 text-xs text-white focus:outline-none focus:border-white rounded-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-white/40 uppercase">Footer Small Text Disclaimer</label>
                    <textarea value={fields.footerCopyrightText} onChange={(e) => handleChange("footerCopyrightText", e.target.value)} rows={2} className="w-full bg-transparent border border-white/10 p-2 text-xs text-white focus:outline-none focus:border-white font-mono rounded-none" />
                    <textarea value={fields.footerDisclaimerText} onChange={(e) => handleChange("footerDisclaimerText", e.target.value)} rows={2} className="w-full bg-transparent border border-white/10 p-2 text-xs text-white focus:outline-none focus:border-white font-mono rounded-none" />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* CTA Generate Buttons Footer */}
          <div className="p-6 border-t border-white/10 bg-[#0F0F0F] sticky bottom-0 z-10 space-y-3.5">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-4 px-6 rounded-none font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                isGenerating 
                  ? "bg-white/10 text-white/40 border-white/5 cursor-not-allowed" 
                  : "bg-white text-black hover:bg-white/90 border-white"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Saving to Workspace...
                </>
              ) : (
                <>
                  <Send className="w-4.5 h-4.5" />
                  Generate & Save {currentFilename}
                </>
              )}
            </button>

          </div>

        </div>

        {/* RIGHT SIDE: REAL-TIME PREVIEW PANEL */}
        <div className="flex-1 bg-[#090909] flex flex-col overflow-hidden relative border-l border-white/10">
          
          {/* TAB BAR */}
          <div className="bg-[#111111] px-6 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 rounded-none text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                  activeTab === "preview" 
                    ? "bg-white text-black border-white" 
                    : "text-white/60 hover:text-white border-transparent"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-4 py-2 rounded-none text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                  activeTab === "code" 
                    ? "bg-white text-black border-white" 
                    : "text-white/60 hover:text-white border-transparent"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                HTML VIEW
              </button>
            </div>

            {/* PREVIEW LAYOUT DIMENSIONS */}
            {activeTab === "preview" && (
              <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 border border-white/10 rounded-none">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-2 rounded-none transition-colors border ${
                    previewDevice === "desktop" ? "bg-white text-black border-white" : "text-white/50 hover:text-white border-transparent"
                  }`}
                  title="Show Desktop View (650px)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-2 rounded-none transition-colors border ${
                    previewDevice === "mobile" ? "bg-white text-black border-white" : "text-white/50 hover:text-white border-transparent"
                  }`}
                  title="Show Mobile Width (380px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* QUICK ACTIONS */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-transparent hover:bg-white/5 text-white transition-all border border-white/20 rounded-none"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/60" />}
                {isCopied ? "Copied!" : "Copy HTML"}
              </button>
              
              <button
                onClick={triggerBrowserDownload}
                className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-white hover:bg-white/90 text-black transition-all border border-white rounded-none"
              >
                <Download className="w-3.5 h-3.5" />
                Download File
              </button>
            </div>
          </div>

          {/* PREVIEW CONTAINER STAGE */}
          <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-[#0D0D0D]">
            
            {statusMessage && (
              <div className={`fixed top-20 right-8 z-50 px-4 py-3 rounded-none flex items-center gap-2.5 text-[10px] uppercase font-bold tracking-widest border font-mono animate-bounce ${
                statusMessage.type === "success" 
                  ? "bg-black border-emerald-500 text-emerald-400" 
                  : "bg-black border-red-500 text-red-400"
              }`}>
                {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <HelpCircle className="w-4 h-4 text-red-400" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {activeTab === "preview" ? (
              <div 
                className={`transition-all duration-300 bg-white border border-white/10 overflow-hidden rounded-none shadow-2xl ${
                  previewDevice === "mobile" 
                    ? "w-[390px] h-[780px] max-h-[780px] border-[16px] border-[#161616]" 
                    : "w-full max-w-[670px] h-full min-h-[600px]"
                }`}
              >
                <iframe
                  title="Newsletter Preview Render"
                  srcDoc={compiledHTML}
                  className="w-full h-full bg-white border-0"
                  sandbox="allow-popups allow-scripts"
                />
              </div>
            ) : (
              <div className="w-full max-w-3xl bg-[#111] border border-white/10 rounded-none overflow-hidden h-full flex flex-col">
                <div className="bg-[#161616] px-5 py-3.5 border-b border-white/10 flex justify-between items-center text-[10px] text-white/50 font-mono uppercase tracking-wider">
                  <span>RAW HTML EXPORT &bull; {currentFilename}</span>
                  <span>{compiledHTML.length.toLocaleString()} bytes</span>
                </div>
                <textarea
                  readOnly
                  value={compiledHTML}
                  className="flex-1 w-full bg-[#111111] p-6 text-white/80 font-mono text-xs focus:outline-none resize-none leading-relaxed overflow-y-auto"
                />
              </div>
            )}

          </div>

        </div>

      </div>

      {/* GENERATION EXPORT MODAL DIALOG */}
      {generationResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/20 rounded-none max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-250">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-none bg-white text-black flex items-center justify-center border border-white">
                <Check className="w-8 h-8" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="font-black text-xs tracking-widest uppercase text-white font-sans">Export Complete!</h3>
                <p className="text-[11px] text-white/50 uppercase tracking-wide leading-normal">
                  Your customized HTML email newsletter has been generated and written to your local file tree.
                </p>
              </div>

              <div className="bg-[#1A1A1A] w-full p-5 rounded-none border border-white/10 text-left space-y-3 font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/40 uppercase tracking-wider">Filename:</span>
                  <span className="text-white font-black">{generationResult.filename}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-t border-white/5 pt-2.5">
                  <span className="text-white/40 uppercase tracking-wider">Status:</span>
                  <span className="text-white font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-white"></span>
                    SUCCESS
                  </span>
                </div>
                <div className="flex flex-col text-[11px] border-t border-white/5 pt-2.5 space-y-1">
                  <span className="text-white/40 uppercase tracking-wider">Workspace Path:</span>
                  <span className="text-white/70 text-[10px] break-all select-all leading-normal">{generationResult.path}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <button
                  onClick={triggerBrowserDownload}
                  className="flex items-center justify-center gap-1.5 bg-white hover:bg-white/90 text-black rounded-none py-3.5 text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <a
                  href={`/${generationResult.filename}`}
                  target="_blank"
                  className="flex items-center justify-center gap-1.5 bg-[#1A1A1A] hover:bg-[#222] text-white border border-white/20 rounded-none py-3.5 text-xs font-black uppercase tracking-widest transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Live
                </a>
              </div>

              <button
                onClick={() => setGenerationResult(null)}
                className="text-[10px] text-white/40 hover:text-white transition-colors font-black uppercase tracking-widest pt-2"
              >
                Back to Editor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
