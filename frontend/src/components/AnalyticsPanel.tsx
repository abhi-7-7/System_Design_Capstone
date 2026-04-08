import React, { Component } from 'react';

interface AnalyticsType {
    total: number;
    completionRate: number;
    inProgress: number;
    todo: number;
    done: number;
}

interface AnalyticsPanelProps {
  data: AnalyticsType;
}

/**
 * AnalyticsPanel Component Class
 * Displays key performance indicators for the SmartFlow dashboard.
 */
class AnalyticsPanel extends Component<AnalyticsPanelProps> {
  render() {
    const { data } = this.props;

    return (
      <div className="mb-8">
        <h3 className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Overview
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121212] border border-[#222] rounded-lg p-5 transition-all duration-300 ease-out hover:border-gray-500/50 hover:-translate-y-1 hover:rounded-xl hover:shadow-[0_0_20px_rgba(243,244,246,0.1)]">
              <div className="text-[13px] text-gray-500 font-medium mb-2">Total Tasks</div>
              <div className="text-3xl font-light text-gray-100">{data.total}</div>
          </div>
          
          <div className="bg-[#121212] border border-[#222] rounded-lg p-5 transition-all duration-300 ease-out hover:border-blue-500/50 hover:-translate-y-1 hover:rounded-xl hover:shadow-[0_0_20px_rgba(96,165,250,0.25)]">
              <div className="text-[13px] text-gray-500 font-medium mb-2">Active</div>
              <div className="text-3xl font-light text-blue-400">{data.inProgress}</div>
          </div>
          
          <div className="bg-[#121212] border border-[#222] rounded-lg p-5 transition-all duration-300 ease-out hover:border-emerald-500/50 hover:-translate-y-1 hover:rounded-xl hover:shadow-[0_0_20px_rgba(52,211,153,0.25)]">
              <div className="text-[13px] text-gray-500 font-medium mb-2">Completed</div>
              <div className="text-3xl font-light text-emerald-400">{data.done}</div>
          </div>
          
          <div className="bg-[#121212] border border-[#222] rounded-lg p-5 transition-all duration-300 ease-out hover:border-indigo-500/50 hover:-translate-y-1 hover:rounded-xl hover:shadow-[0_0_20px_rgba(129,140,248,0.25)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-full w-1 bg-gray-800">
                 <div className="absolute bottom-0 right-0 w-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ height: `${data.completionRate}%`}}></div>
              </div>
              <div className="text-[13px] text-gray-500 font-medium mb-2">Velocity</div>
              <div className="text-3xl font-light text-indigo-400">{data.completionRate}%</div>
          </div>
        </div>
      </div>
    );
  }
}

export default AnalyticsPanel;
