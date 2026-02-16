
export interface HairstyleLook {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isLoading: boolean;
  error?: string;
}

export enum AppStep {
  HOME = 'HOME',
  CAPTURE = 'CAPTURE',
  RESULTS = 'RESULTS'
}
