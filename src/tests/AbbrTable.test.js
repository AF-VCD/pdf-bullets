import AbbrTable from '../../src/components/AbbrTable.js'
import React from 'react';

import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { JpegStream } from '@ckhordiasma/pdfjs-dist/build/pdf.worker';

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



function AbbrWrapper({ initData }) {
  const [data, setData] = React.useState(initData);
  return <AbbrTable data={data} setData={setData} />
}

async function validateTable(screen, expectedData){
  
    
  
    (await screen.findAllByTestId(/value-\d+/)).forEach((input, i)=>{
      expect(input.value).toEqual(expectedData[i].value)
    })
    (await screen.findAllByTestId(/abbr-\d+/)).forEach((input, i)=>{
      expect(input.value).toEqual(expectedData[i].abbr)
    })

    (await screen.findAllByTestId(/enabled-\d+/)).forEach((input, i)=>{
      expect(input.checked).toEqual(expectedData[i].enabled)
  })  

  


}

it('renders without crashing', () => {
  render(<AbbrWrapper initData={defaultData} />)
})





it('shows all data correctly', async () => {
  let container = document.createElement('div')
  render(<AbbrWrapper initData={defaultData} />)
  jest.spyOn(React, 'useRef').mockReturnValue({defaultData});
  await validateTable(screen, defaultData);
})


test.todo('changes when information is edited');
 test.todo('sorts data correctly when considering capitalization')
 test.todo('sorts data correctly when considering numbers')
 test.todo('sorts data correctly when prefixed spaces')

/** 
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

test.todo('filters on disabled abbrs when desired', () => {
  render(<AbbrWrapper initData={defaultData} />)
  const select = screen.getByRole('combobox'); // take the second rowgroup; first rowgroup is the header stuff

  userEvent.selectOptions(select, ['Disabled'])

  const filteredData = defaultData.filter((row) => !row.enabled);

  validateTable(screen, filteredData);
})

*/
/*
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

  const target = screen.getByTestId('value-2');
  expectedData[2].value = 'optimizeasdf';
  userEvent.type(target, expectedData[2].value);
  validateTable(screen, expectedData);
})

it('remains filtered on matches on the global search bar after editing info', async () => {
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

  const target = screen.getByTestId('value-1');
  expectedData[1].value = 'tbbbl'
  userEvent.type(target, expectedData[1].value);
  userEvent.tab();userEvent.tab();userEvent.tab();userEvent.tab();userEvent.tab();
  //await waitFor(()=> expect(screen.getAllByTestId(/row-\d+/).length).not.toEqual(expectedData.length) )
  validateTable(screen, expectedData);

  

})


test.todo('adds row when add button is pressed');
test.todo('filtered view remains active when data is edited')

*/