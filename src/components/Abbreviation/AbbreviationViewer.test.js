import AbbreviationViewer, {importSampleAbbrs, getDataFromXLS, exportToXLS} from './AbbreviationViewer'
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

jest.mock('@handsontable/react', ()=>{
  const {Component} = jest.requireActual('React');
  class MockHotTable extends Component {
    constructor(props) {
      super(props);
      this.hotInstance = { "getData": ()=> this.props.data.map(row=>[row.enabled, row.value, row.abbr]) }
    }
    componentDidMount(){
      this.props.afterChange(null, 'loadData')
    }
    componentDidUpdate(){
      this.props.afterChange(null, 'loadData')
    }
    render() {
      return <div data-testid="parent" onClick={this.props.afterChange}>HELLO WORLD</div>;
    }
  }
  return {
    HotTable: MockHotTable
  }
})


it('renders without crashing', () => {
  render(<AbbreviationViewer data={defaultData} setData={jest.fn()}/>)
})

