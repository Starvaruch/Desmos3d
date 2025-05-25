import api from '../config';
import { EquationData, GraphConfigData, DefaultDataResponse, SaveGraphRequest } from '../types';

export const graphService = {
  /**
   * Get default graph data when no saved data exists
   * @returns Default graph configuration and equations
   */
  async getDefaultData(): Promise<DefaultDataResponse> {
    const response = await api.get<DefaultDataResponse>('/default-data/');
    return response.data;
  },
  
  // Equation related methods
  /**
   * Get all equations
   * @returns List of equations
   */
  async getEquations(): Promise<EquationData[]> {
    const response = await api.get<EquationData[]>('/equations/');
    return response.data;
  },
  
  /**
   * Get a specific equation by ID
   * @param id Equation ID
   * @returns Equation data
   */
  async getEquation(id: number | string): Promise<EquationData> {
    const response = await api.get<EquationData>(`/equations/${id}/`);
    return response.data;
  },
  
  /**
   * Create a new equation
   * @param data Equation data
   * @returns Created equation
   */
  async createEquation(data: Omit<EquationData, 'id'>): Promise<EquationData> {
    const response = await api.post<EquationData>('/equations/', data);
    return response.data;
  },
  
  /**
   * Update an existing equation
   * @param id Equation ID
   * @param data Updated equation data
   * @returns Updated equation
   */
  async updateEquation(id: number | string, data: Partial<EquationData>): Promise<EquationData> {
    const response = await api.put<EquationData>(`/equations/${id}/`, data);
    return response.data;
  },
  
  /**
   * Delete an equation
   * @param id Equation ID
   */
  async deleteEquation(id: number | string): Promise<void> {
    await api.delete(`/equations/${id}/`);
  },
  
  // Graph configuration related methods
  /**
   * Get all graph configurations
   * @returns List of graph configurations
   */
  async getGraphConfigs(): Promise<GraphConfigData[]> {
    const response = await api.get<GraphConfigData[]>('/graph-configs/');
    return response.data;
  },
  
  /**
   * Get saved graph configurations
   * @returns List of saved graph configurations
   */
  async getSavedGraphs(): Promise<GraphConfigData[]> {
    const response = await api.get<GraphConfigData[]>('/graph-configs/saved/');
    return response.data;
  },
  
  /**
   * Get a specific graph configuration by ID
   * @param id Configuration ID
   * @returns Graph configuration data
   */
  async getGraphConfig(id: number): Promise<GraphConfigData> {
    const response = await api.get<GraphConfigData>(`/graph-configs/${id}/`);
    return response.data;
  },
  
  /**
   * Create a new graph configuration
   * @param data Graph configuration data
   * @returns Created graph configuration
   */
  async createGraphConfig(data: Omit<GraphConfigData, 'id'>): Promise<GraphConfigData> {
    const response = await api.post<GraphConfigData>('/graph-configs/', data);
    return response.data;
  },
  
  /**
   * Update an existing graph configuration
   * @param id Configuration ID
   * @param data Updated configuration data
   * @returns Updated graph configuration
   */
  async updateGraphConfig(id: number, data: Partial<GraphConfigData>): Promise<GraphConfigData> {
    const response = await api.put<GraphConfigData>(`/graph-configs/${id}/`, data);
    return response.data;
  },
  
  /**
   * Delete a graph configuration
   * @param id Configuration ID
   */
  async deleteGraphConfig(id: number): Promise<void> {
    await api.delete(`/graph-configs/${id}/`);
  },
  
  /**
   * Save current graph state
   * @param data Current graph state
   * @returns Saved graph configuration
   */
  async saveCurrentGraph(data: SaveGraphRequest): Promise<GraphConfigData> {
    const response = await api.post<GraphConfigData>('/graph-configs/save_current/', data);
    return response.data;
  }
}; 