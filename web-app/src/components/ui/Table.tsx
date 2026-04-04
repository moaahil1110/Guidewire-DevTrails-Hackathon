import type { ReactNode } from "react";

import { Card } from "./Card";
import { Spinner } from "./Spinner";

type Column<T> = {
  label: string;
  key: string;
  render: (row: T) => ReactNode;
};

export function Table<T>({
  columns,
  rows,
  loading,
  emptyState,
}: {
  columns: Array<Column<T>>;
  rows: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
}) {
  if (loading) {
    return (
      <Card>
        <Spinner label="Loading records" />
      </Card>
    );
  }

  if (!rows.length) {
    return <Card>{emptyState}</Card>;
  }

  return (
    <div className="table-wrap">
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
