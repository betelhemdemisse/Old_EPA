import { ClipboardList, Edit, Eye, FastForward, List, Pen, Trash } from "lucide-react";
import { Plus } from "lucide-react";
import IconButton from "../Buttons/IconButton.jsx";
import Button from "../Buttons/Buttons.jsx";


export default function Table({ columns, rows, actions, isreadonly, isFromBasedata, basedataTitle, isonviewdetails }) {
  if (!columns || !Array.isArray(columns) || !rows || !Array.isArray(rows)) {
    return (
      <div className="overflow-x-auto mt-8">
        <div className="px-6 py-12 text-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }
const user = JSON.parse(localStorage.getItem('user') || '{}');

const userPermissions = user.permissions || [];

  const hasPermission = (resource, action) =>
  userPermissions.some(
    (perm) => perm.resource === resource && perm.action === action
  );

const canUploadInvestigation = hasPermission('expert', 'can-upload-investigation');
const canVerifyComplaint = hasPermission('taskForce', 'can-verify-complaint');
const canApproveReject = hasPermission('deputyDirector', 'approve_and-reject');
const canCreate = hasPermission('mainDirector', 'create');

const hasAnyPermission = canUploadInvestigation || canVerifyComplaint || canApproveReject || canCreate;

 const getStatusColor = (status) => {
  const statusLower = String(status).toLowerCase();
  switch (statusLower) {
    case "pending":
      return "bg-[#FFAE41] text-white";
    case "verified":
      return "bg-[#37A537] text-white";
    case "in progress":
      return "bg-indigo-100 text-indigo-800";
    case "under review":
      return "bg-indigo-100 text-indigo-800"; 
    case "rejected":
      return "bg-[#F52E32] text-white";
    case "under_investigation":
      return "bg-[#3BA1F5] text-white";
    case "authorized":
      return "bg-purple-100 text-purple-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-[#37A537] text-white";

    // ✅ Add investigation_submitted
    case "investigation_submitted":
      return "bg-yellow-100 text-yellow-800"; // choose your preferred color

    default:
      return "bg-gray-100 text-gray-800"; // fallback for unknown statuses
  }
};


  const getStatusText = (status) => {
    const statusLower = String(status).toLowerCase();
    if (statusLower === "completed") {
      return "Completed";
    }
    return status;
  };

  return (
    <div className="relative mt-8 w-full overflow-x-auto">
       
      <div className="min-w-[900px] rounded-xl overflow-hidden">
           
        <table className="w-full border-spacing-y-2 border-separate text-sm">
          <thead>
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)}>
                <div className="flex items-center justify-between px-6 py-4 rounded-xl shadow-sm bg-[#387E53] text-white font-medium text-sm">
                  {columns.map((col, colIndex) => (
                    <div key={col.accessor || col.Header} className="flex-1 min-w-[120px]">
                      {col.Header}
                    </div>
                  ))}
                  {actions && (
                    <div className="flex-1 min-w-[120px]">
                      Action
                    </div>
                  )}
                </div>
              </td>
            </tr>
          </thead>
          
          {/* Body with alternating row colors */}
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, idx) => (
                <tr key={row.id ?? idx}>
                  <td colSpan={columns.length + (actions ? 1 : 0)}>
                    <div
                      className={`
                        flex items-center justify-between px-6 py-4 rounded-xl shadow-sm
                        ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
                      `}
                    >
                  {columns.map((col, colIndex) => (
  <div key={col.accessor} className="flex-1 min-w-[120px]">
    {col.accessor === "status" ? (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row[col.accessor])}`}
      >
     {typeof row[col.accessor] === "string"
  ? row[col.accessor]
      .toLowerCase()
      .split("_")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  :  row[col.accessor]}


      </span>
    ) : col.Cell ? (
      <div>{col.Cell(row[col.accessor], row)}</div>
    ) : (
      <div className="truncate">{row[col.accessor] || "-"}</div>
    )}
  </div>
))}


                      {actions && (
                        <div className="flex-1 min-w-[120px] flex items-center justify-start gap-2">
                          {!isonviewdetails && (
                            <IconButton
                              title="View"
                              onClick={() => actions.onView?.(row)}
                              className="p-1.5 hover:bg-gray-100 rounded-md"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </IconButton>
                          )}
                          
                          {/* {!hasAnyPermission && (
                            <IconButton
                              title="View"
                              onClick={() => actions.onshowForm?.(row)}
                              className="p-1.5 hover:bg-gray-100 rounded-md"
                            >
                              <ClipboardList className="w-4 h-4 text-gray-600" />
                            </IconButton>
                          )} */}

                          {/* Assignment buttons */}
                          {actions.onAssignZone && (
                            <Button
                              color="indigo"
                              className="text-xs px-2 py-1"
                              onClick={() => actions.onAssignZone?.(row)}
                            >
                              Assign to Zone
                            </Button>
                          )}

                          {actions.onAssignExpert && (
                            <Button
                              color="green"
                              className="text-xs px-2 py-1"
                              onClick={() => actions.onAssignExpert?.(row)}
                            >
                              Assign to Expert
                            </Button>
                          )}

                          {actions.onAssignWoreda && (
                            <Button
                              color="emerald"
                              className="text-xs px-2 py-1"
                              onClick={() => actions.onAssignWoreda?.(row)}
                            >
                              Assign to Woreda
                            </Button>
                          )}

                          {!isreadonly && (
                            <>
                              <IconButton
                                title="Edit"
                                onClick={() => actions.onEdit?.(row)}
                                className="p-1.5 hover:bg-gray-100 rounded-md"
                              >
                                <Pen className="w-4 h-4 fill-[#387E53] text-[#387E53]" />
                              </IconButton>

                              <IconButton
                                title="Delete"
                                onClick={() => actions.onDelete?.(row)}
                                className="p-1.5 hover:bg-gray-100 rounded-md"
                              >
                                <Trash className="w-4 h-4 fill-[#FF4C4C] text-red-500" />
                              </IconButton>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <div className="px-6 py-12 text-center text-gray-500">
                    No data available
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}