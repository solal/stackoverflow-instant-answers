var mappedQuestionsWithAnswers = {}
const uuid       = new UUID()
const searchPage = new SearchPage(document)
const gateway    = new Gateway()
const queryUUID  = uuid.generatedUUID
var installUUID  = undefined
uuid.retrieveInstallUUID(uuid => {
    installUUID = uuid
})


parseURLs(ids => {
    let url = SETTINGS.stackoverflowAPIURL + '/2.2/questions/'+ids.join(';')+'/answers?order=desc&sort=activity&site=stackoverflow&filter=!b6Aub*uCt1FjWD'

    gateway.get(url, response => {
        let questions = mapQuestions(response.items)

        document.querySelectorAll('.answer-btn').forEach(function(v) {
            let questionId = v.getAttribute('st-id'),
                  question = questions[questionId]

            questionId !== undefined && question !== undefined ?
                v.innerText = ("Instant Answer | "+question.score+" pts") : v.remove()
        })

        mappedQuestionsWithAnswers = questions
    })
})


function mapQuestions(answers) {
    let questions = {}

    for (const answer of answers) {
        if ( !questions.hasOwnProperty(answer.question_id) ) {
            questions[answer.question_id] = answer
        } else {
            let currentAnswer = questions[answer.question_id]
            if ( currentAnswer.score < answer.score ) {
                questions[answer.question_id] = answer
            } else if ( currentAnswer.score === answer.score && answer.is_accepted ) {
                questions[answer.question_id] = answer
            }
        }
    }

    return questions
}


function parseURLs(handler) {
    let hrefs = document.querySelectorAll("#center_col a[href^='http']")
    let ids   = []
    let hasOneValidLInk = false

    for (const href of hrefs) {
        if ( isValidDomain(href.href) ) {
            hasOneValidLInk = true
            let url  = new URL('', href.href)
            let questionId = extractStackoverflowParentId(url)
            ids.push(questionId)

            let parent = href.parentNode
            let btn = document.createElement("button")
            btn.innerHTML = 'Instant Answer'
            btn.className = 'answer-btn'
            btn.setAttribute('link', href.href)
            btn.setAttribute('st-id', questionId)
            btn.setAttribute('drawner-shown', 'no')
            parent.append(btn)
        }
    }

    if (hasOneValidLInk) newSearchQueryEvent()
    handler(ids)
}


function newSearchQueryEvent() {
    let payload = {
        install_uuid: installUUID,
        query_uuid: queryUUID,
        query_text: searchPage.searchQuery,
        results_links: searchPage.links
    }

    if (typeof installUUID === 'undefined') {
        uuid.retrieveInstallUUID((uuid) => {
            payload.install_uuid = uuid
            registerNewSearchQuery(payload)
        })
    } else {
        registerNewSearchQuery(payload)
    }
}


function registerNewSearchQuery(payload) {
    const url = SETTINGS.eventsAPIURL + '/search_query/new'
    gateway.post(url, payload)
}


document.querySelectorAll('.answer-btn').forEach(function(button) {
    button.addEventListener('click', function(e) {
        let drawnerShown = e.currentTarget.getAttribute('drawner-shown');
        let answer       = mappedQuestionsWithAnswers[e.currentTarget.getAttribute('st-id')];

        if (drawnerShown == 'no') {
            let drawer = new AnswerDrawer(e.currentTarget, answer)
            drawer.show()
            newbtnClickedEvent( e.currentTarget.getAttribute('link') )
        } else {
            let drawer = e.currentTarget.nextElementSibling;
            e.currentTarget.setAttribute('drawner-shown', 'no');
            e.currentTarget.innerText = "Instant Answer | "+answer.score+" pts | Seen";
            drawer.remove();
        }
    })
});


function newbtnClickedEvent(btnClickedLink) {
    let payload = {
        install_uuid: installUUID,
        query_uuid: queryUUID,
        query_text: searchPage.searchQuery,
        btn_clicked_href: btnClickedLink
    }

    if (typeof installUUID === 'undefined') {
        uuid.retrieveInstallUUID((uuid) => {
            payload.install_uuid = uuid
            registerNewBtnClicked(payload)
        })
    } else {
        registerNewBtnClicked(payload)
    }
}


function registerNewBtnClicked(payload) {
    const url = SETTINGS.eventsAPIURL + '/search_query/btn_clicked'
    gateway.post(url, payload)
}


function isValidDomain(href) {
    const url = new URL('', href)
    return url.hostname === 'stackoverflow.com' ? true : false
}


function extractStackoverflowParentId(url) {
    const pathEls = url.pathname.split('/')
    return pathEls[2]
}
