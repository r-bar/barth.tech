
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


const SearchResults = () => {
  const index = elasticlunr.Index.load(window.searchIndex);

  const close = () => {
    window.location.hash = '!/';
  };

  return {
    onupdate: vnode => {
      hidden = !Boolean(vnode.attrs.query);
      if (vnode.attrs.query) {
        const rect = vnode.dom.getBoundingClientRect();
        window.scroll(rect.left, rect.top);
      }
    },

    view: (vnode) => {
      let query = vnode.attrs.query;
      let classes = ['search-results'];
      if (!query)
        classes.push('hidden');

      const results = index.search(query);
      const entries = results.map(result =>
        m(ResultEntry, {highlight: query, ...result}));
      return m('div', {'class': classes.join(' ')}, [
        m('h1', `Search results for "${query}"`),
        m('span', {onclick: close, class: "close"}, '✖'),
        ...entries,
      ]);
    }

  }
}


const Search = initVnode => {
  var query = initVnode.attrs.value || '';
  const searchTarget = document.querySelector(initVnode.attrs.target);
  if (!searchTarget) {
    throw "target attribute required for Search";
  }

  const setSearch = newQuery => {
    query = newQuery;
    if (query) {
      window.location.hash = `!/query=${query}`
    } else {
      window.location.hash = `!/`
    }
  };

  return {
    onupdate: vnode => {
      setSearch(vnode.attrs.value);
    },
    view: (vnode) => {
      setSearch(vnode.attrs.value);

      if (searchTarget) {
        m.render(searchTarget, m(SearchResults, {query}));
      }

      if (query != vnode.attrs.value) {
        console.log('query mismatch', query, vnode.attrs.value)
      }

      return m("input", {
        placeholder: "Search site...",
        onchange: event => setSearch(event.target.value),
        value: query,
      });
    },
  }
};


document.addEventListener('DOMContentLoaded', evt => {
  const searchBox = document.getElementById('search-box');
  //m.render(searchBox, m(Search, {value: query}))

  m.route(searchBox, '', {
    '/': {render: vnode => m(Search, {value: vnode.attrs.value, target: '#search-target'})},
    '/query=:value': {render: vnode => m(Search, {value: vnode.attrs.value, target: '#search-target'})},
  });
});
