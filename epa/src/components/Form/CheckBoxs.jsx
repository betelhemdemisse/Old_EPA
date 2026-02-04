import React, { useEffect, useState } from "react";

export default function CheckBoxs({
  title,
  items = [],
  onChange,
  showGlobalSelectAll = true,
  required = false,
  simple = false,
}) {
  const isGroups = items.length > 0 && items[0].items !== undefined;

  const [localGroups, setLocalGroups] = useState(() =>
    isGroups
      ? items.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i })) }))
      : []
  );
  const [localItems, setLocalItems] = useState(() =>
    !isGroups ? items.map((i) => ({ ...i })) : []
  );

useEffect(() => {
  if (isGroups) {
    setLocalGroups((prev) => {
      const incoming = items.map((g) => ({
        ...g,
        items: g.items.map((i) => ({ ...i })),
      }));

      return JSON.stringify(prev) === JSON.stringify(incoming)
        ? prev
        : incoming;
    });
  } else {
    setLocalItems((prev) => {
      const incoming = items.map((i) => ({ ...i }));

      return JSON.stringify(prev) === JSON.stringify(incoming)
        ? prev
        : incoming;
    });
  }
}, [items, isGroups]);


  // Single-card handlers
  function toggleSingleItem(id) {
    const next = localItems.map((i) =>
      i.id === id ? { ...i, checked: !i.checked } : i
    );
    setLocalItems(next);
    onChange?.(next);
  }
  function toggleSingleSelectAll() {
    const allChecked =
      localItems.length > 0 && localItems.every((i) => i.checked);
    const next = localItems.map((i) => ({ ...i, checked: !allChecked }));
    setLocalItems(next);
    onChange?.(next);
  }

  // Multi-group handlers
  function toggleGroupItem(groupIndex, id) {
    const next = localGroups.map((g, gi) => {
      if (gi !== groupIndex) return g;
      return {
        ...g,
        items: g.items.map((i) =>
          i.id === id ? { ...i, checked: !i.checked } : i
        ),
      };
    });
    setLocalGroups(next);
    onChange?.(next);
  }
  function toggleGroupSelectAll(groupIndex) {
    const group = localGroups[groupIndex];
    const allChecked =
      group.items.length > 0 && group.items.every((i) => i.checked);
    const next = localGroups.map((g, gi) =>
      gi === groupIndex
        ? { ...g, items: g.items.map((i) => ({ ...i, checked: !allChecked })) }
        : g
    );
    setLocalGroups(next);
    onChange?.(next);
  }
  function toggleGlobalSelectAll() {
    const allChecked =
      localGroups.length > 0 &&
      localGroups.every((g) => g.items.every((i) => i.checked));
    const next = localGroups.map((g) => ({
      ...g,
      items: g.items.map((i) => ({ ...i, checked: !allChecked })),
    }));
    setLocalGroups(next);
    onChange?.(next);
  }

if (!isGroups) {
  const allChecked =
    localItems.length > 0 && localItems.every((i) => i.checked);
  const someChecked = localItems.some((i) => i.checked) && !allChecked;

  if (simple) {
    return (
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 text-green-600"
          checked={!!localItems[0]?.checked}
          onChange={() => toggleSingleItem(localItems[0].id)}
        />
        <span>{localItems[0]?.label}</span>
      </label>
    );
  }

  return (
    <div className="w-72 bg-white rounded-md border border-gray-100 p-4 m-3 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <strong className="text-sm text-gray-800">{title}</strong>

        {showGlobalSelectAll && (
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-green-600"
              checked={allChecked}
              ref={(el) => {
                if (el) el.indeterminate = someChecked;
              }}
              onChange={toggleSingleSelectAll}
            />
          </label>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {localItems.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-green-600"
              checked={!!item.checked}
              onChange={() => toggleSingleItem(item.id)}
            />
            <span className="text-indigo-700">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}


  const globalAllChecked =
    localGroups.length > 0 &&
    localGroups.every((g) => g.items.every((i) => i.checked));
  const globalSomeChecked =
    localGroups.some((g) => g.items.some((i) => i.checked)) &&
    !globalAllChecked;

  return (
    <div className="w-full">
      {showGlobalSelectAll && (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-green-600"
              checked={globalAllChecked}
              ref={(el) => {
                if (el) el.indeterminate = globalSomeChecked;
              }}
              onChange={toggleGlobalSelectAll}
            />
            <span className="text-sm font-medium">Select All</span>
          </label>
        </div>
      )}

      <div className="bg-transparent -mx-4 px-4 py-3">
        <div className="flex gap-6 justify-between">
          {localGroups.map((g, gi) => {
            const allChecked =
              g.items.length > 0 && g.items.every((i) => i.checked);
            const someChecked = g.items.some((i) => i.checked) && !allChecked;

            return (
              <div
                key={g.id || gi}
                className="flex-1 max-w-sm bg-[#F6F6F6] rounded-md border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="p-2 border-b border-gray-300 flex-1">
                    <strong className="text-sm text-gray-800">{g.title}</strong>
                  </div>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-green-600"
                      checked={allChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someChecked;
                      }}
                      onChange={() => toggleGroupSelectAll(gi)}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  {g.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-green-600"
                        checked={!!item.checked}
                        onChange={() => toggleGroupItem(gi, item.id)}
                      />
                      <span className="text-gray-800">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
