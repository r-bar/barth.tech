+++
title = "The basics of full text search"
date = 2022-10-20
draft = false

[taxonomies]
tags = ["web", "search", "postgres", "sqlite"]
+++

Search is a ubiquitous and expected feature of modern applications. In this
article I will attempt to highlight a path to quickly develop and iterate on
search features using the infrastructure you probably already have.

<!-- more -->

## Just running a search service does not solve the problem

Lucene has been THE standard in open source full text search. The services that
wrap it, Elasticsearch, Apache Solr, and OpenSearch, are powerful tools for
projects trying to make their data discoverable. However, spinning up additional
infrastructure and keeping these search indexes in sync with the source of truth
can add a lot of overhead when you do not need the full breadth of features
these services provide at the start of your project. As much as the companies
behind these products would like to tell you otherwise, just slapping their
search solution onto your project does not solve search. They *can't*. The
problem is too big, and they do not understand the specifics of your problem
domain.

Ok, for unsophisticated use cases like indexing a blog article they probably
realistically *are* able to provide excellent results with no tuning required,
but anything more complicated will require knowledge of your problem domain.
Let's take a reddit-like a news aggregator site as an example. There are many
things that could factor into how likely a user is to be looking for a
particular piece of content.

A search result may be more likely to be correct if:
1. The linked article's text matches the query
1. The comments about the article match the query
1. It has more total upvotes
1. It has more total comments
1. It got more engagement in a shorter period of time
1. It had higher click through than other posts
1. The user has seen or engaged (or NOT!) with the post before
1. The user is subscribed (or NOT!) to the community the result was posted to

All these factors are likely to be encoded outside of the full text index and
not understood by a search service without explicit inclusion in the index and
manually defining mappings and weights.

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

## RDBMS Index Implementations

Since you are still here, let's get to the how!

### Postgresql - pg_trgm

In this section we are going to look at implementing a trigram index. Trigrams
are great for names, language agnostic search, and handling misspellings well.

First, activate the extension.
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Create the text fields to search against. These can be aggregated from multiple
tables and fields using materialized views. We will be using an imaginary
`users` and `addresses` table. In this example we will create 2 indexed fields
based on the user's full name and the city they live in.
```sql
CREATE MATERIALIZED VIEW users_search
AS (
	SELECT
		users.id AS user_id,
		(
			users.first_name
			|| COALESCE(' ' || users.middle_name || ' ', ' ')
			|| users.last_name
		) AS full_name,
		addresses.city || ' ' || addresses.state AS location
	FROM users
	LEFT JOIN addresses ON users.address_id = addresses.id
)
WITH DATA
```

Create the FTS indexes.

```sql
CREATE INDEX users_full_name_search_fts_idx
ON users_search
USING gin (full_name gin_trgm_ops);


CREATE INDEX users_location_search_fts_idx
ON users_search
USING gin (location gin_trgm_ops);
```

> In choosing which index type to use, GiST or GIN, consider these performance
> differences:
>   * GIN index lookups are about three times faster than GiST
>   * GIN indexes take about three times longer to build than GiST
>   * GIN indexes are moderately slower to update than GiST indexes, but about
>     10 times slower if fast-update support was disabled [...]
>   * GIN indexes are two-to-three times larger than GiST indexes


Create a function to keep the materialized view up to date with changes. Note
that between the use of gin indexing and the automated table refresh on record
changes adding or changing a user will not be very fast. The assumption here is
that we will not be adding or changing users very often so sacrifice slower
updates to get the maximum search performance.

```sql
CREATE OR REPLACE FUNCTION refresh_users_search()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
REFRESH MATERIALIZED VIEW CONCURRENTLY users_search;
RETURN NULL;
END $$;

CREATE TRIGGER refresh_users_search_for_users
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE
ON users
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_users_search();

-- optionally add the trigger to the addresses as well
```

Sample query merging the scores from querying both the `full_name` and
`location` indexes.

```sql
SELECT
	users.*,
	similarity(users_search.full_name, :query) + similarity(users_search.location, :query)
		AS ranking
FROM users
LEFT JOIN users_search ON users.id = users_search.user_id
ORDER BY ranking DESC
LIMIT 10
```

In addition to the `similarity()` function shown above the trgm indixes are also
able to speed up queries that use `LIKE`, `ILIKE`, and `REGEX`.

### Sqlite

Coming soon (TM)...

## Conclusion

No one is going to argue that using full text search inside your relational
database is more powerful or full featured than a dedicated service like
Elasticsearch. You may eventually have to migrate to a more full fledged
solution once you hit the limitations of the tools provided by your database.

Instead the techniques here can be useful for projects that have not yet fully
fleshed out their requirements and want to get up and running quickly. The
ceiling on what comes with your database is higher than many people realize. By
the time you are forced to migrate you will have a far greater understanding of
your product, users, and search feature requirements so that when you do make
the investment into a more sophisticated version of your search, you do it
correctly from the start.

## Additional resources
* [The State of (Full) Text Search in PostgreSQL 12](https://archive.fosdem.org/2020/schedule/event/postgresql_the_state_of_full_text_search_in_postgresql_12/)
* [pg_trgm documentation](https://www.postgresql.org/docs/current/pgtrgm.html)
* [Postgres text search functions documentation](https://www.postgresql.org/docs/15/functions-textsearch.html)
