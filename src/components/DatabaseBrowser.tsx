// src/components/DatabaseBrowser.tsx
import { useState, useEffect } from 'react';
import { dbConnectionsApi } from '../services/api.ts';

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
      <div className="glass-card rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          📊 Database Browser
        </h2>
        <div className="text-gray-400 text-center py-8">
          Select a database connection to browse
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          📊 Database Browser
        </h2>
        <button
          onClick={loadOverview}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm"
        >
          Refresh
        </button>
      </div>

      {loading && !overview ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : overview ? (
        <div className="space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-sm text-gray-400">Database</div>
            <div className="text-lg font-semibold text-white">{overview.database}</div>
            <div className="text-sm text-gray-400 mt-2">
              {overview.totalTables} {overview.totalTables === 1 ? 'table' : 'tables'}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-300 mb-2">Tables</div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {overview.tables.map((table: string) => (
                <div
                  key={table}
                  onClick={() => loadTableData(table)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTable === table
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-gray-900/50 border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-white">{table}</div>
                    <div className="text-xs text-gray-400">
                      {overview.tableRowCounts[table] !== undefined
                        ? overview.tableRowCounts[table] >= 0
                          ? `${overview.tableRowCounts[table]} rows`
                          : 'N/A'
                        : '...'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tableData && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-300 mb-2">
                Data from: {tableData.tableName} ({tableData.rowCount} rows)
              </div>
              <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      {tableData.data.length > 0 &&
                        Object.keys(tableData.data[0]).map((key) => (
                          <th key={key} className="px-4 py-2 text-left text-gray-400 font-semibold">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.data.map((row: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-700/30 hover:bg-gray-800/50">
                        {Object.values(row).map((value: any, colIdx: number) => (
                          <td key={colIdx} className="px-4 py-2 text-gray-300">
                            {value != null ? String(value) : 'NULL'}
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
        <div className="text-center py-8 text-gray-400">No data available</div>
      )}
    </div>
  );
}