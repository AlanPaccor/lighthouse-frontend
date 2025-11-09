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
      <div className="bg-background border border-foreground/10 p-8 space-y-8">
        <div className="space-y-4">
          <div className="h-px w-16 bg-foreground"></div>
          <h2 className="text-3xl font-light text-foreground tracking-tight">Database Browser</h2>
          <p className="text-sm text-foreground/60 font-light">
            Browse tables and data from your connected databases
          </p>
        </div>
        <div className="text-center py-12 space-y-4">
          <div className="h-px w-12 bg-foreground/20 mx-auto"></div>
          <div className="text-foreground/60 font-light">No database selected</div>
          <div className="text-xs text-foreground/50 font-light">Select a connection to browse its schema and data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-foreground/10 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <div className="h-px w-16 bg-foreground"></div>
          <h2 className="text-3xl font-light text-foreground tracking-tight">Database Browser</h2>
          <p className="text-sm text-foreground/60 font-light">
            Explore tables, schemas, and query data
          </p>
        </div>
        <button
          onClick={loadOverview}
          className="px-6 py-2 border border-foreground/20 text-foreground text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:border-foreground hover:bg-foreground/5"
        >
          Refresh
        </button>
      </div>

      {loading && !overview ? (
        <div className="text-center py-12 space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-foreground/20 border-t-foreground"></div>
          <div className="text-foreground/60 font-light">Loading database schema...</div>
        </div>
      ) : overview ? (
        <div className="space-y-8">
          <div className="border border-foreground/20 p-6 space-y-4">
            <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Database</div>
            <div className="text-2xl font-light text-foreground">{overview.database}</div>
            <div className="h-px bg-foreground/10"></div>
            <div className="text-sm text-foreground/60 font-light">
              {overview.totalTables} {overview.totalTables === 1 ? 'table' : 'tables'} available
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs text-foreground/60 uppercase tracking-wider font-medium">Tables</div>
            <div className="space-y-px bg-foreground/10">
              {overview.tables.map((table: string) => (
                <div
                  key={table}
                  onClick={() => loadTableData(table)}
                  className={`p-4 bg-background cursor-pointer transition-colors ${
                    selectedTable === table
                      ? 'bg-foreground/5 border-l-4 border-foreground'
                      : 'hover:bg-muted/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-foreground">{table}</div>
                    <div className="text-xs text-foreground/50 font-mono bg-foreground/5 px-3 py-1 border border-foreground/10">
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
            <div className="space-y-4">
              <div className="text-sm font-medium text-foreground">
                <span className="text-foreground/60">Table:</span> {tableData.tableName} <span className="text-foreground/50">({tableData.rowCount.toLocaleString()} rows)</span>
              </div>
              <div className="border border-foreground/10 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-foreground/10">
                      {tableData.data.length > 0 &&
                        Object.keys(tableData.data[0]).map((key) => (
                          <th key={key} className="px-4 py-3 text-left text-foreground/60 font-medium uppercase text-xs tracking-wider">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.data.map((row: any, idx: number) => (
                      <tr key={idx} className="border-b border-foreground/5 hover:bg-muted/10 transition-colors">
                        {Object.values(row).map((value: any, colIdx: number) => (
                          <td key={colIdx} className="px-4 py-3 text-foreground/80 font-mono text-xs">
                            {value != null ? String(value) : <span className="text-foreground/50">NULL</span>}
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
        <div className="text-center py-12 text-foreground/60 space-y-4">
          <div className="h-px w-12 bg-foreground/20 mx-auto"></div>
          <div className="font-light">No data available</div>
          <div className="text-xs text-foreground/50 font-light">Unable to load database information</div>
        </div>
      )}
    </div>
  );
}
