export interface AwardItem {
  name: string;
  deadline: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl?: string;
}

export interface NewsletterFields {
  // Theme selection
  theme: "modern" | "legacy";

  // Header
  signupText: string;
  signupUrl: string;
  headerTitle: string;
  headerSubtitle: string;
  headerImg: string;
  headerImgAlt: string;
  dateText: string;

  // Editor's Note
  editorSalutation: string;
  editorParagraphs: string;
  topAdImg: string;
  topAdUrl: string;
  topAdAlt: string;

  // Lead Story
  leadTitleLabel: string;
  leadImg: string;
  leadStoryTitle: string;
  leadStoryAuthor: string;
  leadStoryParagraphs: string;
  leadStoryButtonText: string;
  leadStoryButtonUrl: string;

  // Hot Marketing Takes
  hotTakesTitleLabel: string;
  hotTakesImg: string;
  hotTakesParagraphs: string;

  // Column Section
  // 1. Podcast Spotlight
  podcastLabel: string;
  podcastTitle: string;
  podcastImg: string;
  podcastContent: string;
  podcastButtonText: string;
  podcastButtonUrl: string;

  // 2. Marketing Webcast
  marketingWebcastLabel: string;
  marketingWebcastTitle: string;
  marketingWebcastImg: string;
  marketingWebcastContent: string;
  marketingWebcastButtonText: string;
  marketingWebcastButtonUrl: string;

  // 3. HR Webcast
  hrWebcastLabel: string;
  hrWebcastTitle: string;
  hrWebcastImg: string;
  hrWebcastContent: string;
  hrWebcastButtonText: string;
  hrWebcastButtonUrl: string;

  // 4. Featured HR Research
  researchLabel: string;
  researchTitle: string;
  researchImg: string;
  researchContent: string;
  researchButtonText: string;
  researchButtonUrl: string;

  // 5. Award Winners
  winnersLabel: string;
  winnersTitle: string;
  winnersImg: string;
  winnersContent: string;
  winnersButtonText: string;
  winnersButtonUrl: string;

  // 6. HR.com Awards
  awardsLabel: string;
  awardsSectionTitle: string;
  awardsList: AwardItem[];

  // Bottom Ad
  bottomAdImg: string;
  bottomAdUrl: string;
  bottomAdAlt: string;

  // Poll
  pollTitle: string;
  pollQuestion: string;
  pollChoice1: string;
  pollChoice1Url: string;
  pollChoice2: string;
  pollChoice2Url: string;
  pollChoice3: string;
  pollChoice3Url: string;
  pollChoice4: string;
  pollChoice4Url: string;

  // Forward Email
  forwardTextContent: string;

  // Footer
  footerFacebookUrl: string;
  footerLinkedinUrl: string;
  footerInstagramUrl: string;
  footerYoutubeUrl: string;
  footerTwitterUrl: string;
  footerClosingText: string;
  footerSubscribeText: string;
  footerSubscribeUrl: string;
  footerUnsubscribeUrl: string;
  footerManageSubscriptionUrl: string;
  footerAdvertiseUrl: string;
  footerPrivacyPolicyUrl: string;
  footerContactUsUrl: string;
  footerCopyrightText: string;
  footerDisclaimerText: string;
}
