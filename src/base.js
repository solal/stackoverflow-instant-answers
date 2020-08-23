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
        mappedQuestionsWithAnswers = mapQuestionsFromAnswers(response.items)

        $('.answer-btn').each(function(k, v) {
            let question,
                questionId = $(v).attr('st-id')

            if ( mappedQuestionsWithAnswers.hasOwnProperty([questionId][0]) )
                question = mappedQuestionsWithAnswers[questionId][0]

            questionId !== undefined && question !== undefined ?
                $(v).text("Instant Answer | "+question.score+" pts") : $(this).remove()
        })
    })
})


function mapQuestionsFromAnswers(answers) {
    // TODO: might want to optimize function using a different data structure
    let questions = {}

    for (const answer of answers) {
        ( !questions.hasOwnProperty(answer.question_id) ) ?
            questions[answer.question_id] = [answer] : questions[answer.question_id].push(answer)
    }

    for (const questionId of Object.keys(questions)) {
        questions[questionId].sort((a, b) => b.score - a.score)
    }

    return questions
}


function parseURLs(handler) {
    let hrefs = $("#center_col a[href^='http']")
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


$('.answer-btn').click(function() {
    let drawnerShown = $(this).attr('drawner-shown');
    let answers      = mappedQuestionsWithAnswers[$(this).attr('st-id')];
    let answer       = answers[0]

    if (drawnerShown == 'no') {
        let drawer = new AnswerDrawer($(this), answer)
        drawer.show()
        newbtnClickedEvent( $(this).attr('link') )
    } else {
        let drawer = $(this).parent().find('.answer-drawer');
        $(this).attr('drawner-shown', 'no');
        $(this).text("Instant Answer | "+answer.score+" pts | Seen");
        drawer.remove();
    }
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
