import BulletComparator from '../../src/components/BulletComparator.js';
import AbbrTable from '../../src/components/AbbrTable.js'
import React from 'react';

import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'


const defaultData = [{
  enabled: true,
  value: 'abbreviations',
  abbr: 'abbrs',
}, {
  enabled: false,
  value: 'table',
  abbr: 'tbl',
}, {
  enabled: true,
  value: 'optimize',
  abbr: 'optim',
}, {
  enabled: false,
  value: 'with ',
  abbr: 'w/',
}, {
  enabled: true,
  value: 'parentheses',
  abbr: 'parens',
},
];



let data;
const setData = (newData) => data = newData;

beforeEach(() => {
  setData(defaultData);
})

function AbbrWrapper({ initData }) {
  const [data, setData] = React.useState(initData);
  return <AbbrTable data={data} setData={setData} />
}

it('renders without crashing', () => {
  render(<AbbrWrapper initData={defaultData} />)
})
it('shows all data correctly', () => {
  render(<AbbrWrapper initData={defaultData} />)
  const rows = screen.getAllByTestId(/row-\d+/);

  rows.forEach((row, i) => {
    expect(row.querySelector('input[type=checkbox]').checked).toEqual(defaultData[i].enabled)
    expect(row.querySelectorAll('input[type=text]')[0].value).toEqual(defaultData[i].value)
    expect(row.querySelectorAll('input[type=text]')[1].value).toEqual(defaultData[i].abbr)
  })
})
it('sorts data correctly by abbreviation', () => {
  render(<AbbrWrapper initData={defaultData} />)
  const sorts = screen.getAllByTitle('Toggle SortBy');
  const sorter = sorts.find(item => item.innerHTML.match(/Abbreviation/));

  userEvent.click(sorter)


  const rows = screen.getAllByTestId(/row-\d+/);

  // need to copy the default data array or else it gets mutated!
  const sortedData = [...defaultData].sort((a, b) => a.abbr.localeCompare(b.abbr));

  rows.forEach((row, i) => {
    expect(row.querySelector('input[type=checkbox]').checked).toEqual(sortedData[i].enabled)
    expect(row.querySelectorAll('input[type=text]')[0].value).toEqual(sortedData[i].value)
    expect(row.querySelectorAll('input[type=text]')[1].value).toEqual(sortedData[i].abbr)
  })

});

it('sorts data correctly by word', () => {
  render(<AbbrWrapper initData={defaultData} />)
  const sorts = screen.getAllByTitle('Toggle SortBy');
  const sorter = sorts.find(item => item.innerHTML.match(/Word/));

  userEvent.click(sorter)

  const rows = screen.getAllByTestId(/row-\d+/);
  // need to copy the default data array or else it gets mutated!
  const sortedData = [...defaultData].sort((a, b) => a.value.localeCompare(b.value));

  rows.forEach((row, i) => {
    expect(row.querySelector('input[type=checkbox]').checked).toEqual(sortedData[i].enabled)
    expect(row.querySelectorAll('input[type=text]')[0].value).toEqual(sortedData[i].value)
    expect(row.querySelectorAll('input[type=text]')[1].value).toEqual(sortedData[i].abbr)
  })

})


it('filters on enabled abbrs when desired', () => {
  render(<AbbrWrapper initData={defaultData} />)
  const select = screen.getByRole('combobox');

  userEvent.selectOptions(select, ['Enabled'])

  const rows = screen.getAllByTestId(/row-\d+/);

  const filteredData = defaultData.filter((row) => row.enabled);

  rows.forEach((row, i) => {
    expect(row.querySelector('input[type=checkbox]').checked).toEqual(filteredData[i].enabled)
    expect(row.querySelectorAll('input[type=text]')[0].value).toEqual(filteredData[i].value)
    expect(row.querySelectorAll('input[type=text]')[1].value).toEqual(filteredData[i].abbr)
  })
})

it('filters on disabled abbrs when desired', () => {
  render(<AbbrWrapper initData={defaultData} />)
  const select = screen.getByRole('combobox'); // take the second rowgroup; first rowgroup is the header stuff

  userEvent.selectOptions(select, ['Disabled'])


  const rows = screen.getAllByTestId(/row-\d+/);

  const filteredData = defaultData.filter((row) => !row.enabled);

  rows.forEach((row, i) => {
    expect(row.querySelector('input[type=checkbox]').checked).toEqual(filteredData[i].enabled)
    expect(row.querySelectorAll('input[type=text]')[0].value).toEqual(filteredData[i].value)
    expect(row.querySelectorAll('input[type=text]')[1].value).toEqual(filteredData[i].abbr)
  })
})

it('filters on matches on the global search bar', async () => {
  render(<AbbrWrapper initData={defaultData} />)
  const search = screen.getByPlaceholderText(/rows\.\.\./);
  const expectedData = [{
    enabled: true,
    value: 'abbreviations',
    abbr: 'abbrs',
  }, {
    enabled: false,
    value: 'table',
    abbr: 'tbl',
  }, {
    enabled: true,
    value: 'parentheses',
    abbr: 'parens',
  },
  ];


  userEvent.type(search, 'a')
  await waitFor(() => expect(screen.getAllByTestId(/row-\d+/).length).toEqual(expectedData.length))


  const rows = screen.getAllByTestId(/row-\d+/);
  rows.forEach((row, i) => {

    expect(row.querySelectorAll('input[type=text]')[0].value).toEqual(expectedData[i].value)
    expect(row.querySelectorAll('input[type=text]')[1].value).toEqual(expectedData[i].abbr)
    expect(row.querySelector('input[type=checkbox]').checked).toEqual(expectedData[i].enabled)
  })

})

it('deletes row when delete button is pressed', async () => {
  render(<AbbrWrapper initData={defaultData} />)

  const expectedData = [{
    enabled: true,
    value: 'abbreviations',
    abbr: 'abbrs',
  }, {
    enabled: true,
    value: 'optimize',
    abbr: 'optim',
  }, {
    enabled: false,
    value: 'with ',
    abbr: 'w/',
  }, {
    enabled: true,
    value: 'parentheses',
    abbr: 'parens',
  },
  ];


  userEvent.click(screen.getByTestId('trash-1'));
  
  screen.getAllByTestId(/row-\d+/).forEach((row, i)=>{
      
      expect(row.querySelectorAll('input[type=text]')[0].value).toEqual(expectedData[i].value)
      expect(row.querySelectorAll('input[type=text]')[1].value).toEqual(expectedData[i].abbr)
      expect(row.querySelector('input[type=checkbox]').checked).toEqual(expectedData[i].enabled)
  })  
  
  
})



it('copies and inserts row when copy button is pressed', ()=>{
  render(<AbbrWrapper initData={defaultData} />)
  userEvent.click(screen.getByTestId('copy-1'));
  
  const expectedData = [{
    enabled: true,
    value: 'abbreviations',
    abbr: 'abbrs',
  }, {
    enabled: false,
    value: 'table',
    abbr: 'tbl',
  },{
    enabled: false,
    value: 'table',
    abbr: 'tbl',
  }, {
    enabled: true,
    value: 'optimize',
    abbr: 'optim',
  }, {
    enabled: false,
    value: 'with ',
    abbr: 'w/',
  }, {
    enabled: true,
    value: 'parentheses',
    abbr: 'parens',
  },
  ];

  screen.getAllByTestId(/row-\d+/).forEach((row, i)=>{
      
      expect(row.querySelectorAll('input[type=text]')[0].value).toEqual(expectedData[i].value)
      expect(row.querySelectorAll('input[type=text]')[1].value).toEqual(expectedData[i].abbr)
      expect(row.querySelector('input[type=checkbox]').checked).toEqual(expectedData[i].enabled)
  })  
})
/*
it('adds row when add button is pressed', ()=>{
    expect(true).toEqual(false);
})

it('filtered view remains active when data is edited', ()=>{
    expect(true).toEqual(false);
})

*/