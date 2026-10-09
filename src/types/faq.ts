export interface FAQQuestion {
  id?: string;
  q: string;
  a: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  questions: FAQQuestion[];
}
