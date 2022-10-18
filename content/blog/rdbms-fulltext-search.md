+++
title = "The basics of full text search"
date = 2022-10-09
draft = true

[taxonomies]
tags = ["web", "search", "postgres"]
+++

Search is a ubiquitous and expected feature of modern applications. In this
article I will attempt to highlight a path to quickly develop and iterate on
search features using the infrastructure you probably already have.

<!-- more -->

### Design tradeoffs

It is important to understand the basic design space of a given search feature.
The following are some of the tradeoffs inherent any time search is used.

#### Precision vs Recall

Precision refers to the accuracy of the results returned. A search the returned
exactly one result with the exact content the user was looking for was 100%
precise. In practicality this is very hard to do. Users do not always know
exactly what they are looking for. In that case it may be useful to return
more results that could also relate to the user's query even if they do not give
the user *exactly* what they were looking for. Precision vs recall is a
formalized design choice within academic literature covering search.

#### Lookup vs Research

Generally there are 2 very different, common behavior patterns for users when
they are looking things up in your application. They either have seen a piece of
content before and are using your search as a quick way to get back to it, or
they are looking for an answer to a question they have and they do not know if
or where they are going to find it. These usage patterns tend to favor precision
for lookup and recall for research.

#### Content type

The object of a user's search can also dictate how you design your search
indices. This can vary widely so here are a few common examples and what works
for them.

**Prose** is the classic subject of full text search. It's main properties
include its length and (more or less) adherence to its language rules. Most
search engines have packaged powerful lemmatization engines for the common
languages. Be sure to use them. The myriad of stop words, stemming for tense,
plurality, gender and other equivalents are generally not worth implementing
yourself for the majority of use cases.

**Names** have a couple properties that make them substantially different from
normal prose. They are short. They often originate from different languages and
regions, making their spelling unintuitive. Especially with names originating
with online communities symbols are significant and may carry their own table of
translations specific to that community. Ngrams and phonemes tend to work best
for users trying to lookup part of a name or one they don't know how to spell. A
strong ranking bonus for exact matches helps users trying to lookup something by
name directly.

**Faceted or structured data** is common when users are looking for business
entities within your system. Typically directly exposing the facets as queryable
fields and searching with high precision or flattening the facets is the easiest
way to go here.

## Why not Lucene?

Modern RDBMS's all come with the basic functions required to create capable
search indexes. You can begin to iterate on your problem domain without worrying
about setting up additional infrastructure first. By iterating with the
resources you already have you will either discover the requirements and index
design you need from a more full featured solution, or discover you don't need
it at all.

Managing additional infrastructure and managing the synchronization of data
between your source of truth and the search service are mandatory additional
complexity. This level of complexity is non-trivial for a fledgling project when
you may not even fully understand your problem space. It is more important to
get a basic solution up and running so you can start getting feedback on your
solution and additional data points for how to tune your search indices.

## Just running a search service does not solve the problem

Lucene has been THE standard in open source full text search. The services that
wrap it, Elasticsearch, Apache Solr, and OpenSearch, are powerful tools for
projects trying to make their data discoverable. However, spinning up additional
infrastructure and keeping these search indexes in sync with the source of truth
can add a lot of overhead when you do not need the full breadth of features
these services provide. As much as the companies behind these products would
like to tell you otherwise, just adding their search solution to your code base
does not solve search. They can't. The problem is too big, and they do not
understand the specifics of your problem domain.

For unsophisticated like indexing a blog article they probably realistically are
able to provide excelent results with no tuning required, but anything more
complicated will require knowledge of your problem domain. Let's take reddit, a
meta blog in it's own right, as an example. There are many things that could
factor into how likely a user is to be looking for a particular piece of
content.

A search result may be more likely to be correct if:
1. It has more total upvotes
1. It has more total comments
1. It got more engagement in a shorter period of time
1. It had higher click through than other posts
1. The user has seen or engaged (or NOT!) with the post before
1. The user HAS NOT seen or engaged with the post before
1. The user is subscribed (or NOT!) to the community the result was posted to
1. The linked article matches the query

All these factors are likely to be encoded as structured data outside of the 
full text index and not understood by a search service without explicit
inclusion in the index and manually defining a mapping and weights.

## RDBMS Index Implementations

### Postgresql

### Sqlite
