export interface Sensor {
  id: string;
  name: string;
  type: 'fridge' | 'freezer' | 'ambient';
  currentTemp: number;
  targetMin: number;
  targetMax: number;
  status: 'ok' | 'warning' | 'critical';
  location: string;
  lastUpdate: Date;
}

export interface TemperatureReading {
  id: string;
  sensorId: string;
  temperature: number;
  timestamp: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  timestamp?: Date;
  comment?: string;
}

export interface Checklist {
  id: string;
  type: 'opening' | 'closing' | 'probe' | 'weekly';
  date: Date;
  items: ChecklistItem[];
  completedBy?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Incident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: Date;
  location: string;
  description: string;
  photos?: string[];
  correctiveActions: string;
  reportedBy: string;
  status: 'open' | 'investigating' | 'resolved';
}

export interface HACCPPlan {
  id: string;
  name: string;
  hazards: string[];
  criticalControlPoints: string[];
  limits: string[];
  monitoring: string[];
  correctiveActions: string[];
  verification: string[];
  recordKeeping: string[];
  createdDate: Date;
  lastModified: Date;
}

export interface Delivery {
  id: string;
  supplier: string;
  referenceId: string;
  date: Date;
  status: {
    intact: boolean;
    inDate: boolean;
    correctQuantity: boolean;
  };
  temperatureCategory: 'chilled' | 'frozen' | 'ambient';
  probeTemperature?: number;
  overallStatus: 'pending' | 'accepted' | 'rejected';
}