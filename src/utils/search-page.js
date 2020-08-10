class SearchPage {
    constructor(doc) {
        this._doc = doc
    }

    get searchQuery() {
        const searchInput = this._doc.querySelector("[name='q']")
        return searchInput.value
    }

    get links() {
        const hrefs = this._doc.querySelectorAll("#center_col a[href^='http']")
        return Array.from(hrefs).map(href => href.href)
    }
}