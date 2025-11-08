// src/components/DatabaseBrowser.tsx
import { useState, useEffect } from 'react';

interface DatabaseBrowserProps {
  connectionId: string | null;
}

export default function DatabaseBrowser({ connectionId }: DatabaseBrowserProps) {
  const [overview, setOverview] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connectionId) {
      loadOverview();
    } else {
      setOverview(null);
      setSelectedTable(null);
      setTableData(null);
    }
  }, [connectionId]);

  const loadOverview = async () => {
    if (!connectionId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/db-connections/${connectionId}/overview`);
      const data = await response.json();
      setOverview(data);
    } catch (error) {
      console.error('Failed to load overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName: string) => {
    if (!connectionId) return;
    setLoading(true);
    setSelectedTable(tableName);
    try {
      const response = await fetch(
        `http://localhost:8080/api/db-connections/${connectionId}/tables/${tableName}/data?limit=50`
      );
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error('Failed to load table data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!connectionId) {
    return (
      <div className="glass-card rounded-2xl p-8 shadow-xl">
        <div className="mb-6">
          <h2 className="card-header">Database Browser</h2>
          <p className="card-subtitle mt-2">
            Browse tables and data from your connected databases
          </p>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div className="text-slate-400 font-medium">No database selected</div>
          <div className="text-slate-500 text-sm mt-1">Select a connection to browse its schema and data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="card-header">Database Browser</h2>
          <p className="card-subtitle mt-2">
            Explore tables, schemas, and query data
          </p>
        </div>
        <button
          onClick={loadOverview}
          className="btn-secondary text-sm"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {loading && !overview ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-slate-700 border-t-blue-400 mb-4"></div>
          <div className="text-slate-400 font-medium">Loading database schema...</div>
        </div>
      ) : overview ? (
        <div className="space-y-6">
          <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Database</div>
            <div className="text-2xl font-bold text-white mb-2">{overview.database}</div>
            <div className="text-sm text-slate-400 font-medium">
              {overview.totalTables} {overview.totalTables === 1 ? 'table' : 'tables'} available
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Tables</div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {overview.tables.map((table: string) => (
                <div
                  key={table}
                  onClick={() => loadTableData(table)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedTable === table
                      ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white">{table}</div>
                    <div className="text-xs text-slate-400 font-medium bg-slate-800/50 px-3 py-1 rounded-lg">
                      {overview.tableRowCounts[table] !== undefined
                        ? overview.tableRowCounts[table] >= 0
                          ? `${overview.tableRowCounts[table].toLocaleString()} rows`
                          : 'N/A'
                        : '...'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tableData && (
            <div className="mt-6">
              <div className="text-sm font-semibold text-slate-300 mb-4">
                <span className="text-slate-400">Table:</span> {tableData.tableName} <span className="text-slate-500">({tableData.rowCount.toLocaleString()} rows)</span>
              </div>
              <div className="bg-slate-900/60 rounded-xl border border-slate-700/50 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      {tableData.data.length > 0 &&
                        Object.keys(tableData.data[0]).map((key) => (
                          <th key={key} className="px-4 py-3 text-left text-slate-400 font-semibold uppercase text-xs tracking-wider">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.data.map((row: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                        {Object.values(row).map((value: any, colIdx: number) => (
                          <td key={colIdx} className="px-4 py-3 text-slate-300 font-mono text-xs">
                            {value != null ? String(value) : <span className="text-slate-500">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <div className="font-medium">No data available</div>
          <div className="text-sm text-slate-500 mt-1">Unable to load database information</div>
        </div>
      )}
    </div>
  );
}