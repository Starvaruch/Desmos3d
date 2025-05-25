// User related types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Equation related types
export interface EquationData {
  id: number | string;
  expression: string;
  color: string;
  visible: boolean;
  graph_config?: number;
  created_at?: string;
  updated_at?: string;
}

// Graph configuration related types
export interface GraphConfigData {
  id: number;
  name: string;
  description?: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xStep: number;
  gridVisible: boolean;
  is_saved?: boolean;
  equations?: EquationData[];
  created_at?: string;
  updated_at?: string;
}

// Default data response type
export interface DefaultDataResponse {
  config: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    xStep: number;
    gridVisible: boolean;
  };
  equations: {
    id: string;
    expression: string;
    color: string;
    visible: boolean;
  }[];
}

// Save graph request type
export interface SaveGraphRequest {
  name: string;
  description?: string;
  config: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    xStep: number;
    gridVisible: boolean;
  };
  equations: {
    expression: string;
    color: string;
    visible: boolean;
  }[];
} 