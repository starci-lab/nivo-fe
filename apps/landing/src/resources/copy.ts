/**
 * Vietnamese copy for the landing site, in one place.
 *
 * Same reason as the control plane's own resources module: `no-second-language-in-source` allowlists
 * content modules because a product's language is content, not authoring, and its `vn-ok:` escape is
 * tested against the node's own text - which can mark a comment and cannot mark a sentence a person
 * reads without writing the pragma into it.
 *
 * Two strings is not much of a module today. It is where the third goes.
 */

/** How the landing site describes itself, in metadata and on the page. */
export const LANDING_DESCRIPTION = "Trang giới thiệu sản phẩm.";
