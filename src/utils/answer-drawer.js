class AnswerDrawer {
    // todo
    // create hide method
    // create method to display markup of info bar

    constructor(context, answer) {
        this._context        = context
        this._answer         = answer
        this._drawerFragment = new DocumentFragment()
        this._generate_elements()

        console.log(answer)
    }


    _generate_elements() {
        const drawer            = document.createElement('div')
        const drawerContent     = document.createElement('div')
        const infoBar           = this._createInfoBar(this._answer)

        drawerContent.innerHTML = this._answer.body

        drawer.className        = 'answer-drawer'
        drawerContent.className = 'drawer-content'

        drawer.appendChild(drawerContent)
        drawer.appendChild(infoBar)

        this._drawerFragment.appendChild(drawer)
        this._drawerFragment.querySelectorAll('pre').forEach(block => {
            hljs.highlightBlock(block)
        })
    }


    _createInfoBar(answer) {
        return document.createRange().createContextualFragment(`
            <table class="info-bar">
                <tbody>
                    <tr>
                        <td>
                            <h1>${answer.score}</h1>
                        </td>

                        <td>
                            <div>
                              <img src="${answer.owner.profile_image}">
                            </div>
                            <div>
                                <h4>
                                    <a href="${answer.owner.link}" target="_blank">${answer.owner.display_name}</a>
                                </h4>
                                <h4>${answer.owner.reputation}</h4>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        `)
    }


    show() {
        this._context.parentElement.append(this._drawerFragment)
        this._context.setAttribute('drawner-shown', 'yes')
    }
}
