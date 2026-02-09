import React from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';

const SharedTable = ({ 
  title,
  data = [],
  columns = [],
  loading = false,
  searchTerm = '',
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
  onView,
  addButtonText = 'Add New',
  showAddButton = true,
  showSearch = true,
  actions = ['view', 'edit', 'delete']
}) => {
  const filteredData = data.filter(item =>
    columns.some(column => 
      item[column.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const renderCellContent = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }
    
    if (column.type === 'status') {
      const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        maintenance: 'bg-yellow-100 text-yellow-800',
        verified: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800'
      };
      
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[item[column.key]] || 'bg-gray-100 text-gray-800'}`}>
          {item[column.key]}
        </span>
      );
    }
    
    return item[column.key] || '-';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            )}
            
            {showAddButton && onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
              >
                <Plus size={20} className="mr-2" />
                {addButtonText}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                    <span className="ml-2 text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCellContent(item, column)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {actions.includes('view') && onView && (
                          <button
                            onClick={() => onView(item)}
                            className="text-yellow-600 hover:text-yellow-700 p-1 rounded hover:bg-yellow-50"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {actions.includes('edit') && onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="text-yellow-600 hover:text-yellow-700 p-1 rounded hover:bg-yellow-50"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {actions.includes('delete') && onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="text-gray-600 hover:text-red-600 p-1 rounded hover:bg-gray-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && filteredData.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {filteredData.length} of {data.length} entries
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedTable;