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

function validateTable(screen, expectedData){
  screen.getAllByTestId(/value-\d+/).forEach((input, i)=>{
    expect(input.value).toEqual(expectedData[i].value)
  })
  screen.getAllByTestId(/abbr-\d+/).forEach((input, i)=>{
    expect(input.value).toEqual(expectedData[i].abbr)
  })
  screen.getAllByTestId(/enabled-\d+/).forEach((input, i)=>{
      expect(input.checked).toEqual(expectedData[i].enabled)
  })  
}

it('renders without crashing', () => {
  render(<AbbrWrapper initData={defaultData} />)
})
it('shows all data correctly', () => {
  render(<AbbrWrapper initData={defaultData} />)

  validateTable(screen, defaultData);
})
it('sorts data correctly by abbreviation', () => {
  render(<AbbrWrapper initData={defaultData} />)
  const sorts = screen.getAllByTitle('Toggle SortBy');
  const sorter = sorts.find(item => item.innerHTML.match(/Abbreviation/));

  userEvent.click(sorter)

  // need to copy the default data array or else it gets mutated!
  const sortedData = [...defaultData].sort((a, b) => a.abbr.localeCompare(b.abbr));

  validateTable(screen, sortedData);

});

it('sorts data correctly by word', () => {
  render(<AbbrWrapper initData={defaultData} />)
  const sorts = screen.getAllByTitle('Toggle SortBy');
  const sorter = sorts.find(item => item.innerHTML.match(/Word/));

  userEvent.click(sorter)

  
  // need to copy the default data array or else it gets mutated!
  const sortedData = [...defaultData].sort((a, b) => a.value.localeCompare(b.value));

  validateTable(screen, sortedData);

})


it('filters on enabled abbrs when desired', () => {
  render(<AbbrWrapper initData={defaultData} />)
  const select = screen.getByRole('combobox');

  userEvent.selectOptions(select, ['Enabled'])

  const filteredData = defaultData.filter((row) => row.enabled);

  validateTable(screen, filteredData);
})

it('filters on disabled abbrs when desired', () => {
  render(<AbbrWrapper initData={defaultData} />)
  const select = screen.getByRole('combobox'); // take the second rowgroup; first rowgroup is the header stuff

  userEvent.selectOptions(select, ['Disabled'])

  const filteredData = defaultData.filter((row) => !row.enabled);

  validateTable(screen, filteredData);
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


  validateTable(screen, expectedData);

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
  
  validateTable(screen, expectedData);
  
  
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

  validateTable(screen, expectedData);

})

it('changes when information is edited', ()=>{
  render(<AbbrWrapper initData={defaultData} />)
  
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
    value: 'optimizeasdf',
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
  const target = screen.getByTestId('value-2');
  userEvent.type(target, expectedData[2].value);
  validateTable(screen, expectedData);
})



/*
it('adds row when add button is pressed', ()=>{
    expect(true).toEqual(false);
})

it('filtered view remains active when data is edited', ()=>{
    expect(true).toEqual(false);
})

*/