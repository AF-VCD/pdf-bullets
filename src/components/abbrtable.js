import React from 'react'
import { useTable } from 'react-table'
import {
    useGlobalFilter,
    useFilters,
    useSortBy,
    useAsyncDebounce,
    useRowSelect
} from 'react-table/dist/react-table.development';
import update from 'immutability-helper'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faTrash, faCheckSquare } from "@fortawesome/free-solid-svg-icons"
import { faSquare } from "@fortawesome/free-regular-svg-icons"

// Define a default UI for filtering
function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
}) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200)

    return (
        <span>
            Search:{' '}
            <input className="input"
                value={value || ""}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={`${count} rows...`}
                style={{
                    fontSize: '1.1rem',
                    border: '0',
                }}
            />
        </span>
    )
}

// Define a default UI for filtering
function DefaultColumnFilter({
    column: { filterValue, setFilter },
}) {

    return (
        <input className="input"
            value={filterValue || ''}
            onChange={e => {
                setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
            }}
            placeholder={`Search...`}
        />
    )
}

// This is a custom filter UI for selecting
// a unique option from a list
function BooleanFilter({
    column: { filterValue, setFilter },
}) {
    // Calculate the options for filtering
    // using the preFilteredRows

    const options = React.useMemo(() => (['All', 'Enabled', 'Disabled']), []);
    const values = React.useMemo(() => ([undefined, true, false]), []);

    const currentSelection = options[values.indexOf(filterValue)]

    // Render a multi-select box
    return (
        <div className="select">
            <select
                value={currentSelection}
                onChange={e => {
                    e.preventDefault();
                    setFilter(values[options.indexOf(e.target.value)])
                }}
            >
                {options.map((text, i) => (
                    <option key={i} value={text}>
                        {text}
                    </option>
                ))}
            </select>
        </div>
    )
}


const SelectCheckbox = ({
    value,
    row,
    column: { id },
    updateDataAfterInput,
}) => {
    // We need to keep and update the state of the cell normally

    const { onChange: onSelChange, style, indeterminate, ...rowSelectProps } =
        React.useMemo(() => row.getToggleRowSelectedProps(), [row]);

    const onChange = React.useCallback((e) => {
        updateDataAfterInput(row.index, id, e.target.checked);
        onSelChange(e);
    }, [onSelChange, id, row.index, updateDataAfterInput])

    const mergedStyle = update(style, { '$merge': { display: "none" } })
    return (
        <div style={{ textAlign: "center" }}>
            <label className="icon is-large">
                <input type="checkbox" data-testid={"enabled-" + row.index} onChange={onChange} style={mergedStyle} {...rowSelectProps} />
                <FontAwesomeIcon size="2x" icon={value ? faCheckSquare : faSquare} />
            </label>
        </div>
    )
};

// Create an editable cell renderer
const EditableCellTemplate = ({
    value: initialValue,
    row: { index },
    column: { id },
    updateDataAfterInput,  // This is a custom function that we supplied to our table instance
}, props) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = e => {
        setValue(e.target.value);
    }

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        updateDataAfterInput(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    return <input className="input" type='text' value={value} onChange={onChange} onBlur={onBlur} data-testid={props.col + '-' + index} />;

}



function AbbrTable({ data, setData }) {
    const skipTableResetRef = React.useRef();
    // mapping of raw data columns to something meaningful


    // When our cell renderer calls updateDataAfterInput, we'll use
    // the rowIndex, columnId and new value to update the
    // original data
    const updateDataAfterInput = (rowIndex, columnId, value) => {
        skipTableResetRef.current = true;
        setData(oldData => {
            const newData = update(oldData, {
                [rowIndex]: {
                    [columnId]: { $set: value }
                }
            });
            return newData;
        });
    }

    React.useEffect(() => {
        skipTableResetRef.current = false;
    })
    const filterTypes = React.useMemo(
        () => ({
            // boolean filter
            boolean: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id]
                    return rowValue !== undefined
                        ? (rowValue === filterValue) : true
                })
            },
        }),
        []
    )


    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    )

    const appendRow = (beforeIndex) => {
        skipTableResetRef.current = true;
        const beforeRecord = data[beforeIndex];
        setData(
            update(data, {
                $splice: [
                    [beforeIndex + 1, 0, beforeRecord]
                ]
            })
        );
    };

    const deleteRow = (beforeIndex) => {
        skipTableResetRef.current = true;
        setData(
            update(data, {
                $splice: [
                    [beforeIndex, 1]
                ]
            })
        );
    };
    const byValue = React.useMemo(()=> (a, b) => {
        const cA = String(a.values.value).trimStart();
        const cB = String(b.values.value).trimStart();
        return cA.localeCompare(cB, 'en', { numeric: true })
    } , [])
    const byAbbr = React.useMemo(()=> (a, b) => {
        const cA = String(a.values.abbr).trimStart();
        const cB = String(b.values.abbr).trimStart();
        return cA.localeCompare(cB, 'en', { numeric: true })
    } , [])
    const columns = React.useMemo(() => [
        {
            Header: "Status",
            accessor: 'enabled',
            Cell: SelectCheckbox,
            Filter: BooleanFilter,
            filter: 'boolean',
            disableSortBy: true,
            disableGlobalFilter: true,
        },
        {
            Header: "Word",
            accessor: 'value',
            sortType: byValue,
            Cell: (data) => EditableCellTemplate(data, { col: "value" }),
        },
        {
            Header: 'Abbreviation',
            accessor: 'abbr',
            sortType: byAbbr,
            Cell: (data) => EditableCellTemplate(data, { col: "abbr" }),
        },
    ], []);

    // note that columns and data must be memoized !
    const tableInstance = useTable(
        {
            columns,
            data,
            defaultColumn,
            filterTypes,
            updateDataAfterInput,
            autoResetSelectedRows: false,
            manualRowSelectedKey: 'enabled',
            autoResetGlobalFilter: !skipTableResetRef.current,
            autoResetSortBy: !skipTableResetRef.current,
        },
        useFilters,
        useGlobalFilter,
        useSortBy,
        useRowSelect,
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        visibleColumns,
        state,
        setGlobalFilter,
        preGlobalFilteredRows,
    } = tableInstance;

    return (
        <table className="table is-hoverable" {...getTableProps()}>
            <thead>
                <tr>
                    <th
                        colSpan={visibleColumns.length}
                        style={{
                            textAlign: 'left',
                        }}
                    >
                        <GlobalFilter
                            preGlobalFilteredRows={preGlobalFilteredRows}
                            globalFilter={state.globalFilter}
                            setGlobalFilter={setGlobalFilter}
                        />
                    </th>
                </tr>
                {headerGroups.map(headerGroup => {
                    return (
                        <tr {...headerGroup.getHeaderGroupProps()}>

                            {headerGroup.headers.map(column => {
                                // taking the default header props, then adding in toggle props. can keep chaining if wanted.
                                return (
                                    <th {...column.getHeaderProps()}>
                                        <div {...column.getSortByToggleProps()}>
                                            {column.render('Header')}
                                            <span>{column.isSorted ? (column.isSortedDesc ? ' v' : ' ^') : ''}</span>
                                        </div>
                                        <div>{column.canFilter ? column.render('Filter') : null}</div>
                                    </th>);
                            })}
                            {/*this empty th is for the add delete stuff*/}
                            <th></th><th></th>
                        </tr>
                    )
                })}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(
                    (row, index) =>
                        prepareRow(row) || (
                            <Row
                                index={index}
                                row={row}
                                rowOps={{ appendRow, deleteRow }}
                                {...row.getRowProps()}
                            />
                        )
                )}
            </tbody>
        </table>
    );
}


const Row = ({ row, index, rowOps }) => {

    return (
        <tr data-testid={"row-" + index}>

            {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
            })}
            <td>
                <a className="icon is-large" data-testid={"copy-" + index} onClick={() => rowOps.appendRow(index)}>
                    <FontAwesomeIcon icon={faCopy} size="2x" />
                </a>
                <a className="icon is-large" data-testid={"trash-" + index} onClick={() => rowOps.deleteRow(index)}>
                    <FontAwesomeIcon icon={faTrash} size="2x" />
                </a>
            </td>
        </tr>
    )
}

export default AbbrTable;