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

        $('.answer-btn').each(function(k, v) {
            let questionId = $(v).attr('st-id'),
                  question = questions[questionId]

            questionId !== undefined && question !== undefined ?
                $(v).text("Instant Answer | "+question.score+" pts") : $(this).remove()
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
    let answer       = mappedQuestionsWithAnswers[$(this).attr('st-id')];

    if (drawnerShown == 'no') {
        let drawer        = document.createElement('div');
        drawer.className  = 'answer-drawer';
        addAnswerContent($(this), drawer, answer);
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


function addAnswerContent(context, drawer, answer) {
    let drawerColumn        = document.createElement('div');
    let drawerContent       = document.createElement('div');
    let drawerClear         = document.createElement('div');
    drawerContent.innerHTML = answer.body;
    drawerColumn.innerHTML  = getScoreMarkup(answer.score);

    drawerColumn.className  = 'drawer-column';
    drawerContent.className = 'drawer-content';
    drawerClear.className   = 'drawer-clear';

    drawer.appendChild(drawerColumn);
    drawer.appendChild(drawerContent);
    drawer.appendChild(drawerClear);
    context.parent().append(drawer);
    context.attr('drawner-shown', 'yes');

    document.querySelectorAll('pre').forEach(block => {
        hljs.highlightBlock(block);
    });
}


function isValidDomain(href) {
    const url = new URL('', href)
    return url.hostname === 'stackoverflow.com' ? true : false
}


function extractStackoverflowParentId(url) {
    const pathEls = url.pathname.split('/')
    return pathEls[2]
}


function getScoreMarkup(score) {
    return `
    <div class="container">
        <div class="action">
            <div class="trophy">
                <svg fill="#FFD600" width="100%" height="100%" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"></path>
                </svg>
            </div>
            <div class="score">${score}</div>
            <div class="confetti"></div>
            <div class="confetti two"></div>
            <div class="confetti three"></div>
            <div class="confetti four"></div>
            <div class="confetti--purple"></div>
            <div class="confetti--purple two"></div>
            <div class="confetti--purple three"></div>
            <div class="confetti--purple four"></div>
        </div>
    </div>`
}