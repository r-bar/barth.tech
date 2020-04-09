
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
    return m('div', {class: 'search-result'}, [
      m('a', {href: ref}, m('h2', doc.title)),
      preview,
    ])
  }
}


class SearchResults {
  oninit(vnode) {
    this.index = elasticlunr.Index.load(window.searchIndex);
  }
  view(vnode) {
    var query;
    try {
      query = vnode.attrs.query;
    } catch (error) {}

    let classes = ['search-results'];
    if (!query) {
      classes.push('hidden');
      return m('div', {'class': classes.join(' ')})
    }
    const results = this.index.search(query);
    const entries = results.map(result =>
      m(ResultEntry, {highlight: query, ...result}));
    return m('div', {'class': classes.join(' ')}, [
      m('h1', `Search results for "${query}"`),
      ...entries,
    ]);
  }
}


const Search = initVnode => {
  var query = '';
  try {
    query = initVnode.attrs.value;
  } catch (error) {}

  const setSearch = newQuery => {
    query = newQuery;
    window.location.hash = `!/query=${query}`
  };

  const onsearch = event =>
    setSearch(event.target.value);

  return {
    view: () => {
      return m("input", {
        placeholder: "Search site...",
        oninput: onsearch,
        onchange: onsearch,
        value: query,
      });
    },
  }
};


document.addEventListener('DOMContentLoaded', evt => {
  // This is an ugly workaround because mithril does not allow calling m.route
  // multiple times. I would prefer to just use mithril to orchestrate the routes
  let query = '';
  try {
    query = window.location.hash.match(/query=(.*)/)[1]
  } catch (e) {}
  const searchBox = document.getElementById('search-box');
  m.render(searchBox, m(Search, {value: query}))

  const searchTarget = document.getElementById('search-target')
  m.route(searchTarget, '', {
    '/': SearchResults,
    '/query=:query': SearchResults,
  });
});
