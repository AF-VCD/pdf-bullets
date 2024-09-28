import { PureComponent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const handleCardClick = (word, This) => {
  return (e) => {
    e.preventDefault();
    This.props.onSelReplace(word);
  };
};

class SynonymViewer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      synonyms: [],
      hidden: true,
    };
  }
  getSynonyms = (phrase) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        const dat = JSON.parse(xhttp.responseText);

        if (dat.length !== 0) {
          this.setState({
            synonyms: dat.map((item) => {
              return item.word;
            }),
          });
        } else {
          this.setState({
            synonyms: [],
          });
        }
      }
    };
    const maxWords = 75;
    xhttp.open(
      "GET",
      "https://api.datamuse.com/words?max=" + maxWords + "&ml=" + phrase,
      true
    );
    xhttp.send();
  };
  componentDidMount() {
    this.getSynonyms(this.props.word);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.word !== this.props.word) {
      this.getSynonyms(this.props.word);
    }
  }

  render() {
    const replacedWord = this.props.abbrReplacer(this.props.word);
    const otherAbbrs = this.props.abbrDict[this.props.word];
    const header = (
      <span className="tag is-medium">
        <Synonym
          word={this.props.word}
          key={this.props.word}
          abbr={replacedWord === this.props.word ? "" : replacedWord}
          otherAbbrs={otherAbbrs}
        />
        <a
          className="icon is-small"
          onMouseDown={handleCardClick(this.props.word, this)}
        >
          <FontAwesomeIcon icon={faPlus} size="xs" color="#51cf66" />
        </a>
      </span>
    );

    const synonyms = (
      <SynonymList
        onSelReplace={this.props.onSelReplace}
        key={this.state.synonyms.join("")}
        synonyms={this.state.synonyms}
        abbrDict={this.props.abbrDict}
        abbrReplacer={this.props.abbrReplacer}
      />
    );
    const explanation = (
      <span className="panel-block" key="init">
        Auto-thesaurus box - highlight a word or phrase below to show synonyms
        in this box
      </span>
    );
    const noResults = (
      <span className="panel-block" key="none">
        no results found
      </span>
    );
    let mainBody;
    if (this.props.word === "") {
      mainBody = explanation;
    } else if (this.state.synonyms.length === 0) {
      mainBody = noResults;
    } else {
      mainBody = synonyms;
    }

    return (
      <div className="card">
        <header className="card-header has-background-light	is-shadowless">
          <div className="card-header-title">
            <span>Thesaurus{this.props.word ? ":" : ""}</span>
            {this.props.word ? header : ""}
          </div>
          <a className="card-header-icon" onClick={this.props.onHide}>
            <span className="delete"></span>
          </a>
        </header>
        <div
          className="card-content"
          style={{ height: "290px", overflow: "auto" }}
        >
          {mainBody}
        </div>
      </div>
    );
  }
}

class SynonymList extends PureComponent {

  render() {
    return (
      <div>
        <div className="tags are-medium ">
          {this.props.synonyms.map((word, i) => {
            const replacedWord = this.props.abbrReplacer(word);
            const otherAbbrs = this.props.abbrDict[word];
            return (
              <span className="tag" key={i}>
                <Synonym
                  word={word}
                  abbr={replacedWord === word ? "" : replacedWord}
                  otherAbbrs={otherAbbrs}
                />
                <a className="icon" onMouseDown={handleCardClick(word, this)}>
                  <FontAwesomeIcon icon={faPlus} size="xs" color="#51cf66" />
                </a>
              </span>
            );
          })}
        </div>
      </div>
    );
  }
}
/**
 * otherAbbrs: {
 *   enabled: [array of abbreviations],
 *   disabled: [array of abbreviations]
 * }
 *
 */
class Synonym extends PureComponent {
  render() {
    //don't forget! you need to add capability to check on disabled abbreviations
    let mainAbbrDisp = "";
    if (this.props.abbr) {
      mainAbbrDisp = (
        <span style={{ fontWeight: "bold" }}>
          {" (" + this.props.abbr + ")"}
        </span>
      );
    }

    let enabledAbbrDisp = "";
    let disabledAbbrDisp = "";

    if (this.props.otherAbbrs) {
      if (this.props.otherAbbrs.enabled) {
        let enabledAbbrs = this.props.otherAbbrs.enabled.filter((abbr) => {
          return abbr !== this.props.abbr;
        });
        if (enabledAbbrs.length > 0) {
          enabledAbbrDisp = (
            <span style={{ fontStyle: "italic" }}>
              {" (" + enabledAbbrs.join(",") + ")"}
            </span>
          );
        }
      }

      if (this.props.otherAbbrs.disabled) {
        let disabledAbbrs = this.props.otherAbbrs.disabled;
        if (disabledAbbrs.length > 0) {
          disabledAbbrDisp = (
            <span style={{ fontStyle: "italic" }}>
              {" (" + disabledAbbrs.join(",") + ")"}
            </span>
          );
        }
      }
    }
    return (
      <span>
        <span>{this.props.word}</span>
        {mainAbbrDisp}
        {enabledAbbrDisp}
        {disabledAbbrDisp}
      </span>
    );
  }
}
export default SynonymViewer;
export { Synonym, SynonymList };
