+++
title = "The Perfect Kubernetes Homelab"
date = 2022-06-12
draft = true
[taxonomies]
tags = ["kubernetes", "homelab"]
+++
I would like to talk about some options for the actual kubernetes distribution.
There are plenty of articles comparing and reviewing each of these. I am
specifically going to be looking at using these various distributions in the
context of a homelab.

<!-- more -->

# Goals

1. Act as a learning and experimentation platform
2. Allow me to run useful open source software
3. Minimize costs
4. Minimize required maintenance
5. Maximize flexibility and portability

# Choosing a Kubernetes Distribution for the Homelab

## Cloud Vendor Distributions


### EKS, GKE, and AKS

EKS, GKE, and AKS are the fully managed kubernetes distributions for Amamzon Web
Services, Google Cloud Platform, and Microsoft Azure repectively. These will
often be the default choices of kubernetes distrubitions for companies without
the need to support on-prem solutions. They are incredibly popular in small and
medium enterprises. These distributions have the best integration with the
various features and offerings of these providers and are only a couple clicks
to setup.

In general the managed platforms from the big 3 cloud vendors will be the most
expensive solution. This is not ideal for a homelab setup that is unlikely to
make you money directly. There could be an argument for using these in a homelab
setup if you needed to learn to use them for your job.


### Digital Ocean Kubernetes and Linode Kubernetes

Smaller cloud service providers like Digital Ocean, Linode, and Vultr are fairly
popular in self hosting enthusiast circles and also provide fully managed
kubernetes distributions. These distributions share many of the pros and cons
with the managed offerings from Amazon, Microsoft and Google. In general they
are very quick to setup and let you take full advantage of the providers
services out of the box.

They do come with a couple of their own trade-offs however. In general these
smaller providers offer their services for cheaper than their big 3
counterparts. Their services, particularly around complex security and auditing,
are more simple and less capable. They also do not provide the same level of
data center localities and fallbacks.


### A note for kubernetes newbies

Kubernetes is a huge platform that can take you a long time to get your head
around. This is doubly true if you are new to linux administration.

I have been pretty bearish in my reviews of the cloud provided kubernetes here.
However, I am writing these reviews from the context of someone with an
intermediate familiarity with kubernetes and almost a decade of linux
administration and application development.

As someone new to kubernetes you should know that there really are 2 almost
entirely separate domains of kubernetes knowledge. Those domains are using
kubernetes and administering kubernetes. It is entirely possible to learn
to use kubernetes without having to learn how to manage it.


## kubeadm

kubeadm is the official installer for kubernetes. It is incredibly flexible
and well documented. The flexibility comes with some complexity however. You
will have the choose the appropriate network, storage, and control plane
options. You will also have to solve distributing the kubeadm binaries to each
of your hosts and executing the appropriate initialization commands for your
setup.


## kubespray

Kubespray is a community maintained ansible script that actually wraps kubeadm.
It solves many of kubeadm's pain points by handling the orchestration of nodes,
distribution of binaries, and chooses sane defaults from kubeadm's myriad of low
level options.

I played around extensively with kubespray, but was never happy with it. The
inherent complexity of the underlying tools along with the fast changing nature
of the kubernetes ecosystem makes for an unstable combo. The few times I
revisited my homelab cluster I found my kubespray config broken since the last
time I used it.


## Openshift


## Rancher (RKE)


## k3s


# Storage


## Database management


# Wide nodes
