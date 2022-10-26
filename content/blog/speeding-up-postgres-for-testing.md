+++
title = "Speeding up PostgreSQL for testing"
date = 2022-10-26
draft = true

[taxonomies]
tags = ["web", "postgres", "performance", "testing"]
+++

I have been working with a philosophy that integration tests are generally more
useful than unit tests. So much of the application's properties are dependant on
defining correct database interactions it is useful to actually test those
interactions generate the desired outcome. The problem is that tests that hit
the database are generally slower than tests that don't.

<!-- more -->

One thing you can do to help integration test speed is speed up interactions
with the database. Databases provide many very useful guarantees to keep your
data safe. They perform file system black magic to ensure anything you commit
you will be able to get back even in the event of a catastrophe. In a test
scenario with disposable data you don't need those guarantees. We can tell
postgres to disable the mechanisms for these persistence guarantees.

This is the command I am currently using to launch postgres for my integration
tests.
```
postgres \
  -c 'shared_buffers=128MB' \
  -c 'fsync=off' \
  -c 'synchronous_commit=off' \
  -c 'full_page_writes=off' \
  -c 'client_min_messages=warning'
```

Let's go through each of these options to see what they do.

### [`fsync=off`](https://www.postgresql.org/docs/15/runtime-config-wal.html#GUC-FSYNC)

> If the `fsync` parameter is `on`, the PostgreSQL server will try to make sure
that updates are physically written to disk, by issuing `fsync()` system calls.

By setting it to `off` we allow postgres to skip the disk on updates and remove
the disk as a system bottleneck.

### [`shared_buffers=128MB`](https://www.postgresql.org/docs/15/runtime-config-resource.html#GUC-SHARED-BUFFERS)

> Sets the amount of memory the database server uses for shared memory buffers.

The higher we set this value, the more memory Postgres will consume with
database updates before persisting it to disk. You will probably have to tweak
this value depending on your available system resources and test data size.

### [`synchronous_commit=off`](https://www.postgresql.org/docs/15/runtime-config-wal.html#GUC-SYNCHRONOUS-COMMIT)

> Specifies how much WAL processing must complete before the database server
returns a “success” indication to the client. The behavior of all non-off
modes is to wait for WAL to flush to disk. In `off` mode, there is no
waiting, so there can be a delay between when success is reported to the client
and when the transaction is later guaranteed to be safe against a server crash.

### [`full_page_writes=off`](https://www.postgresql.org/docs/15/runtime-config-wal.html#GUC-FULL-PAGE-WRITES)

> When this parameter is on, the PostgreSQL server writes the entire content of
each disk page to WAL during the first modification of that page after a
checkpoint. This is needed because a page write that is in process during an
operating system crash might be only partially completed, leading to an on-disk
page that contains a mix of old and new data.

### [`client_min_messages=warning`](https://www.postgresql.org/docs/15/runtime-config-client.html#GUC-CLIENT-MIN-MESSAGES)

> Controls which message levels are sent to the client. ... The later the level,
the fewer messages are sent. The default is NOTICE.

Upping the minimum message level to warning results in fewer messages being
transmitted overall while still allowing your application to raise relevant
warnings and issues.
