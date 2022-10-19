
class ResultEntry {
  preview(highlight, body) {
    const previewLength = 120;
    const tokenRe = /(\w+)(\W*)/;
    const highlightTerms = highlight.match(/\w+/g).map(s => s.toLowerCase());
    const longestTerm = highlightTerms.reduce((len, term) => {
      if (term.length > len) {
        return term.length;
      } else {
        return len;
      }
    }, 0);
    const firstTermPos = highlightTerms.reduce((pos, term) => {
      const termPos = body.toLowerCase().indexOf(term);
      if (termPos >= 0 && termPos < pos || pos === -1) {
        return termPos;
      } else {
        return pos;
      }
    }, -1);
    let corpus = body.slice(0, previewLength);
    if (firstTermPos > previewLength) {
      corpus = body.slice(
        firstTermPos - (previewLength / 2),
        firstTermPos + (previewLength / 2)
      );
    }

    let preview = [];
    let pointer = 0;
    let match = corpus.match(tokenRe);
    while (match) {
      const [section, token, sep] = match;
      if (highlightTerms.includes(token.toLowerCase())) {
        preview.push(m('span', {'class': 'term-highlight'}, token), sep);
      } else {
        preview.push(section);
      }
      pointer += section.length;
      match = corpus.slice(pointer).match(tokenRe);
    }

    if (corpus.length < body.length)
      preview.push('...');

    preview = preview.reduce((accum, entry) => {
      const last = accum.pop();
      if (last === undefined) {
        accum.push(entry);
      } else if (typeof(last) === 'string' && typeof(entry) === 'string') {
        accum.push(last + entry);
      } else {
        accum.push(last, entry);
      }
      return accum;
    }, []);

    return m('p', {'class': 'preview'}, preview);
  }
  view(vnode) {
    let {doc, ref, highlight} = vnode.attrs;
    let preview = this.preview(highlight, doc.body);
    return m('div', {class: 'post on-list'}, [
      m('h1', {class: 'post-title'}, [m('a', {href: ref}, doc.title)]),
      m('div', {class: 'post-content'}, preview),
    ])
  }
}


const SearchResults = () => {
  const index = elasticlunr.Index.load(window.searchIndex);

  return {
    view: (vnode) => {
      let query = vnode.attrs.query;
      let results = index.search(query);
      let resultContent = [m('h1', `Search results for "${query}"`), m('hr')];
      if (results.length) {
        resultContent.push(...results.map(result =>
          m(ResultEntry, {highlight: query, ...result})));
      } else {
        resultContent.push(m('p', 'No results found.'));
      }
      return m('div', {'class': 'search-results posts'}, resultContent);
    }
  }
}


document.addEventListener('DOMContentLoaded', _evt => {
  const searchResultsTarget = document.getElementById('search-results');
  const url = new URL(window.location.href)
  const query = url.searchParams.get('q')

  if (searchResultsTarget && query) {
    m.render(searchResultsTarget, m(SearchResults, {query}));
  }

});
