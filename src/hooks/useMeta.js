import { useEffect } from 'react'

function setMetaContent(selector, content) {
  if (!content) return
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute('content', content)
}

function setLinkHref(rel, href) {
  if (!href) return
  const el = document.head.querySelector(`link[rel="${rel}"]`)
  if (el) el.setAttribute('href', href)
}

export function useMeta({ title, description, canonical, ogType, ogUrl, ogTitle, ogDescription, ogImage }) {
  useEffect(() => {
    const prev = {
      title: document.title,
      description: document.head.querySelector('meta[name="description"]')?.content,
      canonical: document.head.querySelector('link[rel="canonical"]')?.href,
      ogType: document.head.querySelector('meta[property="og:type"]')?.content,
      ogUrl: document.head.querySelector('meta[property="og:url"]')?.content,
      ogTitle: document.head.querySelector('meta[property="og:title"]')?.content,
      ogDescription: document.head.querySelector('meta[property="og:description"]')?.content,
      ogImage: document.head.querySelector('meta[property="og:image"]')?.content,
      twTitle: document.head.querySelector('meta[name="twitter:title"]')?.content,
      twDescription: document.head.querySelector('meta[name="twitter:description"]')?.content,
      twImage: document.head.querySelector('meta[name="twitter:image"]')?.content,
    }

    if (title) document.title = title
    setMetaContent('meta[name="description"]', description)
    setLinkHref('canonical', canonical)
    setMetaContent('meta[property="og:type"]', ogType)
    setMetaContent('meta[property="og:url"]', ogUrl)
    setMetaContent('meta[property="og:title"]', ogTitle || title)
    setMetaContent('meta[property="og:description"]', ogDescription || description)
    setMetaContent('meta[property="og:image"]', ogImage)
    setMetaContent('meta[name="twitter:title"]', ogTitle || title)
    setMetaContent('meta[name="twitter:description"]', ogDescription || description)
    setMetaContent('meta[name="twitter:image"]', ogImage)

    return () => {
      if (prev.title) document.title = prev.title
      setMetaContent('meta[name="description"]', prev.description)
      setLinkHref('canonical', prev.canonical)
      setMetaContent('meta[property="og:type"]', prev.ogType)
      setMetaContent('meta[property="og:url"]', prev.ogUrl)
      setMetaContent('meta[property="og:title"]', prev.ogTitle)
      setMetaContent('meta[property="og:description"]', prev.ogDescription)
      setMetaContent('meta[property="og:image"]', prev.ogImage)
      setMetaContent('meta[name="twitter:title"]', prev.twTitle)
      setMetaContent('meta[name="twitter:description"]', prev.twDescription)
      setMetaContent('meta[name="twitter:image"]', prev.twImage)
    }
  }, [title, description, canonical, ogType, ogUrl, ogTitle, ogDescription, ogImage])
}
