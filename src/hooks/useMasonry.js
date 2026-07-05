import { useCallback, useEffect, useRef } from 'react'

/**
 * True masonry for a CSS grid without reordering the DOM.
 *
 * The grid uses a 1px `grid-auto-rows` track; each item is told how many
 * tracks to span based on the natural height of its inner content, so items
 * of different aspect ratios pack tightly with no dead space beneath the
 * shorter ones — while keeping the reading order intact (unlike CSS columns).
 *
 * Markup contract (see ProjectDetail):
 *   <div ref={ref} class="…gallery">
 *     <figure class="…gallery-item">
 *       <div class="…gallery-inner"> …measured content… </div>
 *     </figure>
 *   </div>
 *
 * @param {number} rowGap  vertical gap between stacked items, in px
 * @param {*}      deps    recompute when these change (e.g. the items array)
 */
export function useMasonry(rowGap = 16, deps = []) {
  const ref = useRef(null)

  const layout = useCallback(() => {
    const grid = ref.current
    if (!grid) return

    // Span math is column-count agnostic: each item reserves as many 1px row
    // tracks as its content is tall (plus the row gap), so items pack tightly
    // whether the grid is showing two columns or has collapsed to one.
    const items = grid.querySelectorAll('.pdetail__gallery-item')
    items.forEach((el) => {
      const inner = el.firstElementChild
      if (!inner) return
      const height = inner.getBoundingClientRect().height
      const span = Math.ceil(height + rowGap) // 1px row tracks + gap reserve
      el.style.gridRowEnd = `span ${span}`
    })
  }, [rowGap])

  useEffect(() => {
    layout()

    // Re-run as images decode (they load lazily and change item height).
    const grid = ref.current
    const imgs = grid ? Array.from(grid.querySelectorAll('img')) : []
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', layout, { once: true })
    })

    const ro = new ResizeObserver(layout)
    if (grid) ro.observe(grid)
    window.addEventListener('resize', layout)

    return () => {
      imgs.forEach((img) => img.removeEventListener('load', layout))
      ro.disconnect()
      window.removeEventListener('resize', layout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, ...deps])

  return ref
}
