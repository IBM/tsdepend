FROM alpine:latest

LABEL repository="http://github.com/alexanderbartels/tsdepend"
LABEL homepage="http://github.com/alexanderbartels/tsdepend"
LABEL "com.github.actions.name"="Update Branch"
LABEL "com.github.actions.description"="Automatically merge the stable branch into the development one."
LABEL "com.github.actions.icon"="git-merge"
LABEL "com.github.actions.color"="blue"

RUN apk --no-cache add bash curl git jq

ADD entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]