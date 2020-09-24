import { RepErrorCode } from "@noumenae/sai/dist/database/repository";



const emptyError =
`Umm...you sent me an empty document; what am I supposed to do
with that, hmm?`
;


const headSyntaxError =
`Whoops, looks like there's an error with the header. Your
file should look **similar** to the following:
\`\`\`
---
title: The Sky
author: your name
questions:
 - what is the sky
 - where is the sky
level: 0
---
Information about the sky
\`\`\``
;


const headError =
`Uh-oh :astonished: I don't detect the header at all. Make sure you've
not forgotten to place the \`---\` characters before and after the
header content.`
;


const questionError =
`**Missing or Bad Questions**
Hmm...:thinking: there are a few things that could have happened here.
You've either not entered any questions, the questions you've entered
are invalid *(contain bad chars/are not valid questions)* or...you've
done something like so: \`questions: is this a question\`

In the case of the latter, remember that questions are formatted like
this in the header:
\`\`\`
questions:
 - question 1
 - question 2
\`\`\`
**Invalid Questions**
Make sure your questions also do not contain anything but
*small-case letters*. Also, your questions must contain a *query word*
like: \`what\`, \`where\`, \`who\` etc...to start the question.`
;


const titleError =
`**Missing Title**
You've forgotten to enter a title or formed it incorrectly.`
;


const authorError =
`**Missing Author**
You've forgotten to set the author or formed it incorrectly.`
;


const answerError =
`**Missing Answer**
This is odd...you've somehow forgotten to send the file with an
answer...that's embarrassing :face_with_hand_over_mouth:`
;


const levelError =
`**Bad Level**
Hmm...:thinking: this could be caused by either having forgotten to
enter the level or...you entered a negative level.

I can't imagine you'd be silly enough to enter a **negative** level,
so it must be the former reason...:smirk:`
;


const duplicateError =
`:face_with_monocle: **Duplicate Question**
Now this one is a bit more tricky to nail down...two or more of the
questions you supplied, resolve to the same \`id\`. This means that
you're using a synonym in both questions which resolve to the
same *index*.

Here's an example:
\`how big is the earth\`
\`how large is the earth\`

Both of the questions above resolve to the same \`id\` because
*large* and *big* are both synonyms that refer to the same *index*
position inside the dictionary.

:thinking:...
There is another potential reason if the one above is not
entirely accurate. Certain words like *is* and *the* are actually
removed during processing.

The above questions are actually interpreted like this by
the AI:
\`how big earth\`
\`how large earth\`

This means if your questions use a combination of words where
*optional* words were removed, then they might actually
turn out to be identical questions like below.

\`how big earth\` and \`how big is the earth\` are actually
identical questions to the AI.`
;

const editIdError =
`**Edit ID Not Found**
Whoops, it looks like you're using an invalid \`editId\`. If
you know the question, you should be able to search it and
retrieve the *working* id.`
;


export const saiErrorResponses: string[] = [];
saiErrorResponses[ RepErrorCode.Empty       ] = emptyError;
saiErrorResponses[ RepErrorCode.HeadSyntax  ] = headSyntaxError;
saiErrorResponses[ RepErrorCode.Head        ] = headError;
saiErrorResponses[ RepErrorCode.Question    ] = questionError;
saiErrorResponses[ RepErrorCode.Title       ] = titleError;
saiErrorResponses[ RepErrorCode.Author      ] = authorError;
saiErrorResponses[ RepErrorCode.Answer      ] = answerError;
saiErrorResponses[ RepErrorCode.Level       ] = levelError;
saiErrorResponses[ RepErrorCode.DuplicateId ] = duplicateError;
saiErrorResponses[ RepErrorCode.BadEditId   ] = editIdError;



