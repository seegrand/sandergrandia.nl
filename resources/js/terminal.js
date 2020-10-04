// Javascript Terminal

/* global Terminal */
const Terminal = require('javascript-terminal');

const TEXT_OUTPUT = 'text-output';
const ERROR_OUTPUT = 'error-output';
const HEADER_OUTPUT = 'header-output';

const CHAR_DELAY = 1;
const LINE_DELAY = 1;

// User interface
const viewRefs = {
    input: document.getElementById('input'),
    output: document.getElementById('output-wrapper')
};

// Utilities
const addKeyDownListener = (eventKey, target, onKeyDown) => {
    target.addEventListener('keydown', e => {
        if (e.key === eventKey) {
            onKeyDown();

            e.preventDefault();
        }
    });
};

document.addEventListener('keydown', e => {
    if (document.activeElement.id !== 'input') {
        viewRefs.input.focus();
    }
});

const scrollToPageEnd = () => {
    window.scrollTo(0, document.body.scrollHeight);
};

const decodeHtml = (html) => {
    let txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

const timer = (ms) => {
    return new Promise(res => setTimeout(res, ms));
};

function pause(milliseconds) {
    let dt = new Date();
    while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
}

const createOutputDiv = (className, textContent) => {
    const div = document.createElement('div');

    div.className = className;
    div.appendChild(document.createTextNode(textContent));

    return div;
};

const outputToHTMLNode = {
    [Terminal.OutputType.TEXT_OUTPUT_TYPE]: content =>
        createOutputDiv(TEXT_OUTPUT, content),
    [Terminal.OutputType.TEXT_ERROR_OUTPUT_TYPE]: content =>
        createOutputDiv(ERROR_OUTPUT, content),
    [Terminal.OutputType.HEADER_OUTPUT_TYPE]: content =>
        createOutputDiv(HEADER_OUTPUT, `$ ${content.command}`)
};

let outputLines = 0;

async function displayOutputs(outputs, animate = false) {
    viewRefs.input.disabled = true;

    // Reset view if output is empty.
    if (outputs.count() === 0) {
        outputLines = 0;
        viewRefs.output.innerHTML = '';
    }

    const outputNodes = outputs.map(output =>
        outputToHTMLNode[output.type](output.content)
    );

    let lastHeaderOutputIndex = 0;

    for (let i = 0; i < outputNodes.size; i++) {
        if (outputNodes.get(i).classList.value.includes(HEADER_OUTPUT)) {
            lastHeaderOutputIndex = i;
        }
    }

    for (let i = outputLines; i < outputNodes.size; i++) {
        // Animation text
        if (animate) {
            // Display content instantly
            let animation = decodeHtml(outputNodes.get(i).innerHTML);

            let frames;
            if (animation.includes("\n")) {
                frames = animation.split("\n");
            } else {
                frames = [animation];
            }

            frames.map((frame, i) => {
                viewRefs.output.append(createOutputDiv(TEXT_OUTPUT, frame));
            });
        } else {
            // Split multiline text output into multiple elements.
            if (outputNodes.get(i).classList.value.includes(TEXT_OUTPUT) && outputNodes.get(i).innerHTML.includes("\n")) {
                let lines = outputNodes.get(i).innerHTML.split("\n");
                for (let line of lines) {
                    // Decode HTML
                    line = decodeHtml(line);

                    if (i >= lastHeaderOutputIndex) {
                        // Create empty text-output div
                        let textDiv = createOutputDiv(TEXT_OUTPUT, '');
                        viewRefs.output.append(textDiv);
                        await typeLine(line, textDiv);
                        await timer(LINE_DELAY);
                    } else {
                        viewRefs.output.append(createOutputDiv(TEXT_OUTPUT, decodeHtml(line)));
                    }

                    scrollToPageEnd();
                }
            } else {
                if (i >= lastHeaderOutputIndex && outputNodes.get(i).className !== HEADER_OUTPUT) {
                    // Decode HTML
                    let line = decodeHtml(outputNodes.get(i).innerHTML);

                    // Create empty text-output div
                    let textDiv = createOutputDiv(outputNodes.get(i).className === TEXT_OUTPUT ? TEXT_OUTPUT : ERROR_OUTPUT, '');
                    viewRefs.output.append(textDiv);
                    await typeLine(line, textDiv);
                    await timer(LINE_DELAY);
                } else {
                    viewRefs.output.append(outputNodes.get(i));
                }

                scrollToPageEnd();
            }

            outputLines++;
        }
    }

    if (!animate) {
        viewRefs.input.disabled = false;
        viewRefs.input.focus();
    }
}

const getInput = () => viewRefs.input.value;

const setInput = (input) => {
    viewRefs.input.value = input;
};

const clearInput = () => {
    setInput('');
};

const stringifyMessage = (message) =>
    message.join('\n');

const urlifyTextOutput = (textOutput) => {
    let text = textOutput.innerHTML.split(' '), urlifiedText="";

    for (let i = 0; i < text.length; i++) {
        urlifiedText += urlify(text[i]) + " ";
    }

    textOutput.innerHTML = urlifiedText;

    return textOutput;
};

const urlify = (message) => {
    let urlRegex = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    return message.replace(urlRegex, function(url) {
        return '<a target="_blank" href="' + url + '">' + url + '</a>';
    })
};

const typeLine = async (line, div) => {
    for (let j = 0; j < line.length; j++) {
        div.innerHTML += line[j];
        scrollToPageEnd();
        await timer(CHAR_DELAY);
    }

    urlifyTextOutput(div);

    return div;
};

const customCommands = [
    'who', 'what', 'where', 'why', 'when', 'how', 'help', 'exit'
];

const customCommandMapping = Terminal.CommandMapping.create({
    ...Terminal.defaultCommandMapping,
    'who': {
        'function': (state, opts) => {
            return {
                output: Terminal.OutputFactory.makeTextOutput(stringifyMessage(who()))
            };
        },
        'optDef': {}
    },
    'what': {
        'function': (state, opts) => {
            return {
                output: Terminal.OutputFactory.makeTextOutput(stringifyMessage(what()))
            };
        },
        'optDef': {}
    },
    'where': {
        'function': (state, opts) => {
            return {
                output: Terminal.OutputFactory.makeTextOutput(stringifyMessage(where()))
            };
        },
        'optDef': {}
    },
    'why': {
        'function': (state, opts) => {
            return {
                output: Terminal.OutputFactory.makeTextOutput(stringifyMessage(why()))
            };
        },
        'optDef': {}
    },
    'when': {
        'function': (state, opts) => {
            return {
                output: Terminal.OutputFactory.makeTextOutput(stringifyMessage(when()))
            };
        },
        'optDef': {}

    },
    'how': {
        'function': async (state, opts) => {
            animate(how());

            return {
                output: null
            };
        },
        'optDef': {}
    },
    'help': {
        'function': (state, opts) => {
            return {
                output: Terminal.OutputFactory.makeTextOutput(stringifyMessage(help()))
            };
        },
        'optDef': {}
    },
    'exit': {
        'function': (state, opts) => {
            return {
                output: Terminal.OutputFactory.makeTextOutput(stringifyMessage(exit()))
            };
        },
        'optDef': {}
    }
});

const animate = (animation, fps = 8) => {
    animation.map((frame, i) => {
        setTimeout(() => {
            let outputs = emulatorState.getOutputs();
            frame = frame[0];

            if (i !== 0) {
                outputs = outputs.pop();

                for (let l = 0; l < frame.length; l++) {
                    viewRefs.output.lastChild ? viewRefs.output.lastChild.remove() : null;
                }
            }

            outputs = Terminal.Outputs.addRecord(outputs, Terminal.OutputFactory.makeTextOutput(stringifyMessage(frame)));

            emulatorState = emulatorState.setOutputs(outputs);

            displayOutputs(emulatorState.getOutputs(), true).then(r => {
                // Ignore promise.
            });

            if (i === 0) {
                scrollToPageEnd();
            }

            if (i === animation.length - 1) {
                viewRefs.input.disabled = false;
                viewRefs.input.focus();

                outputLines += 1;
            }
        }, i * (1000 / fps));
    });
};

const customFileSystem = Terminal.FileSystem.create({
    '/bin': { },
    '/boot': { },
    '/etc': { },
    '/media': { },
    '/mnt': { },
    '/root': { },
    '/sys': { },
    '/usr': { },
    '/usr/seegrand/passwords': {content: 'Haha! Did you really think you were gonna find something here?! Come on man! ;)'},
    '/usr/seegrand/coffee.sh': {content: '#!/bin/sh\n#\n# Requires coffee script in your bin\n#\n\nexec coffee'},
    '/usr/seegrand/coffee.rb': {content: '#!/usr/bin/env ruby\n\n# Exit early if no sessions with my username are found\nexit unless `who -q`.include? ENV[\'USER\']\n\nrequire \'net/telnet\'\n\ncoffee_machine_ip = \'10.10.42.42\'\npassword = \'1234\'\npassword_prompt = \'Password: \'\ndelay_before_brew = 17\ndelay = 24\n\nsleep delay_before_brew\ncon = Net::Telnet.new(\'Host\' => coffee_machine_ip)\ncon.cmd(\'String\' => password, \'Match\' => /#{password_prompt}/)\ncon.cmd(\'sys brew\')\nsleep delay\ncon.cmd(\'sys pour\')\ncon.close\n\nCredits: https://github.com/narkoz/hacker-scripts'},
    '/var': { },
    '/~': { },
    '/README': {content: 'Hey!\nI can see that you have found the internal file structure. Nice one!\n\nDid you find anything else of interest?', canModify: false},
});

// Execution
const emulator = new Terminal.Emulator();

let emulatorState = Terminal.EmulatorState.create({
    'fs': customFileSystem,
    'commandMapping': customCommandMapping
});

const historyKeyboardPlugin = new Terminal.HistoryKeyboardPlugin(emulatorState);
const plugins = [historyKeyboardPlugin];

function updateOutputWrapper() {
    displayOutputs(emulatorState.getOutputs()).then(r => {
        // Ignore promise.
    });
    clearInput();
}

addKeyDownListener('Enter', viewRefs.input, () => {
    const commandStr = getInput();

    emulatorState = emulator.execute(emulatorState, commandStr, plugins);
    updateOutputWrapper();
});

addKeyDownListener('ArrowUp', viewRefs.input, () => {
    setInput(historyKeyboardPlugin.completeUp());
});

addKeyDownListener('ArrowDown', viewRefs.input, () => {
    setInput(historyKeyboardPlugin.completeDown());
});

addKeyDownListener('Tab', viewRefs.input, () => {
    const autoCompletionStr = emulator.autocomplete(emulatorState, getInput());

    setInput(autoCompletionStr);
});

addKeyDownListener('Escape', viewRefs.input, () => {
    setInput('');
});

function welcome() {
    let message = [
        `              _____                 __             ______                     ___      `,
        `             / ___/____ _____  ____/ /__  _____   / ____/________ _____  ____/ (_)___ _`,
        `             \\__ \\/ __ '/ __ \\/ __  / _ \\/ ___/  / / __/ ___/ __ '/ __ \\/ __  / / __ '/`,
        `            ___/ / /_/ / / / / /_/ /  __/ /     / /_/ / /  / /_/ / / / / /_/ / / /_/ / `,
        `           /____/\\__,_/_/ /_/\\__,_/\\___/_/      \\____/_/   \\__,_/_/ /_/\\__,_/_/\\__,_/  `,
        ` `,
        `__                                                                                            _ _   `,
        `\\ \\             ___ _                             _             _                       _   _|_|_|_ `,
        ` \\ \\    ___ ___|  _| |_ _ _ _ ___ ___ ___       _| |___ _ _ ___| |___ ___ _____ ___ ___| |_| |   | |`,
        `  > >  |_ -| . |  _|  _| | | | .'|  _| -_|     | . | -_| | | -_| | . | . |     | -_|   |  _| |   | |`,
        ` / /   |___|___|_| |_| |_____|__,|_| |___|_____|___|___|\\_/|___|_|___|  _|_|_|_|___|_|_|_| |_|_ _|_|`,
        `/_/                                      |_____|                     |_|                     |_|_|  `,
        ` `,
        ` `,
        `         _                    _ `,
        ` __ __ _| |_  ___  __ _ _ __ (_)`,
        ` \\ V  V / ' \\/ _ \\/ _' | '  \\| |`,
        `  \\_/\\_/|_||_\\___/\\__,_|_|_|_|_|`,
        ` `,
        ` `,
        `Find out who I am...`,
        `              ...just with a few commands.`,
        ` `,
        `Ask WH commands or whatever works.`,
        ` `,
        ` `,
    ];
    const textOutputs = [];

    message.forEach((line) => {
        textOutputs.push(Terminal.OutputFactory.makeTextOutput(line));
    });

    const customOutputs = Terminal.Outputs.create(textOutputs);
    emulatorState = emulatorState.setOutputs(customOutputs);
    updateOutputWrapper();
}

function init() {
    welcome();
}

function who() {
    return [
        `                          # (,/*,..,,*,,(`,
        `                         #(,,,,..,.,,,.,,*//`,
        `                        #*,**///,***,,,**,,,*`,
        `                        /,*/##%%%%&%%%%%%#/.,`,
        `                        ***#%%%%%%&&&%%%%%#,,#`,
        `                       #*,##(((#%%&&&&%%#%#*,(`,
        `                       ((/%#/,**/##%#(/*(##%*#`,
        `                       #%(#%%&&%%#%%%%%%#%%%(#`,
        `                        *(#(#%###((###%#%%###`,
        `                          ((#%#*##&@%#.%#%#`,
        `                          //#####%#%%%%%##`,
        `                          %##/((#%%%%####`,
        `                       %##%%%##((((((####/`,
        `                 (%#######(%%%%%%###%%%%#/((#`,
        `           ,%%%%%#%%########((%%%%%%%%%%%(((((((((#*`,
        `         %%%%%##%############((((%%%&%%%((((((((((/(((#%`,
        `       ,##########(#(##########(((((((#(((((((((((//((((#.`,
        `       #######(##(#(############(/(((((((((((((((((/(((#(#.`,
        `      ######(###((((/######%%###(/(((((((((((((((((((((((##`,
        `      ####(###(#((((/((####%##&&##/(((((((((((%((((/((((((#`,
        `     *###(###(#(((#((((((###&##&%&%/(((((((%#%&(#(/(((/(((##`,
        `     ###((#########(#(((((##%&#%&#((/(((#%%%%&(((///(((((###`,
        `    /###############(/((##((##((#(##&#%%((%%&#(%((((((((((###`,
        `     (/##%%%%%&&&&%%#/(((((((((((%&%(#%%#(%##(#((//(#%%%%%###/`,
        `      #(#%%%%%%%%%%%//(/(((((((((#%(#(#&%((%#((/*,(##%%%%#%##/`,
        `      .(##%%%%%%%%%#(%%%%%%&%%%#(*(//(%%#(*//*,,,.*/(#(######/`,
        `       ((##%%%%%%%###%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##/`,
        `       ,(##%%%%%%%%%%%%#(#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#`,
        `        ((##%%%%%%%%%%%%%%%%##(,##%##%%%%%%%%%%%%%%%%%%%%%%%#`,
        `         ((##%%%%%%%%%%%%%%#%#######(/(##%%%################*`,
        `          /((#%%%%%%%%%#######%##%%########(((((((((((#%##%`,
        `           /(###(####(((##########(((****/**/*///(/(`,
        `           /*/////////////*/*///(///((((((((((//((((        ─▄▀─▄▀`,
        `           /**///////////////(/((((((/((((((((((((/         ──▀──▀`,
        `                                                            █▀▀▀▀▀█▄`,
        `Name:      Sander Grandia                                   █░░░░░█─█`,
        `Location:  Gelderland, The Netherlands                      ▀▄▄▄▄▄▀▀`,
        `Expertise: Magento 2, Laravel 7, Wordpress 6, UNIX, PHP 5/7, MySQL, nginx`,
        ` `,
        `Hobbies:   🎸 🚵 🏸 💻 👾 🎲 🏎‍`
    ];
}

function what() {
    return [
        `            ▄▄                                                   ▄▄▄▄▄▄▄▄`,
        `        ▄▄██████▄▄                                           ▄██▀▀      ▐▀██▄`,
        `     ▄███▀      ▀███▄      ▐█▀▀▀▀█                        █████▀ ▐▀████▀  ▐█████▄`,
        `  ▐███▀            ▀███     █▌    █▄                     █▌████    ▀███    ▐███▐█`,
        `  ▐██    ██   ▐██   ▐██      ▀█    ▀█        █▀▀▀▀▄     ▐█  ███▌    ▀███    ▐█▌ █▌`,
        `  ▐██   ███   ▐██▌  ▐██       ▀█    ▐█        ▀▄  ▐█    ▐█  ▐███▄   █████   ▐█  █▌`,
        `  ▐██   ███   ▐██▌  ▐██        ▀█     █▄  ▄▄▄▄▀▀█▀▀      █▄  ▀███  ▐█ ███▌  █   █`,
        `  ▐██   ███   ▐██▌  ▐██         ▀█▄▄██▀██▀       ▀▄      ▐█▄  ████ █   ███ █▀  █▀`,
        `   ▀█   ███   ▐██▌  ▐▀▀                 ▀█     ▄▄▄█▀       ██  ████    ▐███▌ ▄█▀`,
        `        ███   ▐██▌                       ▐███▀▀▀            ▐██▄██▀     ▀████▀`,
        `          ▀███▀                                                 ▀▀██████▀▀`,
        ` `,
        `        Magento 2                     Laravel 7                 Wordpress 6`
    ];
}

function where() {
    return [
        `               ▄████▄██████▄`,
        `            ███▀ ███  █    ███`,
        `           ██   █            █`,
        `          ████  █            █`,
        `          █   █▄███          █`,
        `          █  ██  █████    ███`,
        `         █   ███░ ██      ███`,
        `        █    ▀████          █`,
        `      ██                  ██`,
        `     ██▀       x     ██▄███▀`,
        `  ██████████        █▄`,
        `▐███████             ██`,
        `██████████████        █`,
        `██░███        ▐█████ ██`,
        `                   ███`,
        `                  █  █`,
        `                  ███`,
        ` `,
        `Can you guess where?`,
        ` `,
        `You can also find me on:`,
        `    - Linkedin:  🔗 https://linkedin.com/in/sandergrandia/`,
        `    - GitHub:    🔗 https://github.com/seegrand/`,
        `    - Instagram: 🔗 https://instagram.com/sander969/`,
        `    - About:     🔗 https://sander.grandia.it/`
    ];
}

function why() {
    return [
        `because...`
    ];
}

function when() {
    return [
        `   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒`,
        `   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒`,
        `   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`,
        `   ░░░░░░░░██░░██░░██░░██░░░░░░░░`,
        `   ░░░░░░░░██░░██░░██░░██░░░░░░░░`,
        `   ░░░░░░░░██░░██░░██░░██░░░░░░░░`,
        `   ░░██░░░░██░░██░░██░░██░░░░░░░░`,
        `   ░░░░████░░░░░░██░░░░████████░░`,
        `   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`,
        `   ░░░░░░░░░░░░░░▒▒▒▒░░░░░░░░░░░░`,
        `   ░░░░░░░░░░░░▒▒▒▒▒▒░░░░░░░░░░░░`,
        `   ░░░░░░░░░░░░░░▒▒▒▒░░░░░░░░░░░░`,
        `   ░░░░░░░░░░░░░░▒▒▒▒░░░░░░░░░░░░`,
        `   ░░░░░░░░░░░░░░▒▒▒▒░░░░░░░░░░░░`,
        `   ░░░░░░░░░░░░░░▒▒▒▒░░░░░░░░░░░░`,
        `   ░░░░░░░░░░░░▒▒▒▒▒▒▒▒░░░░░░░░░░`,
        `   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`,
        ` `,
        `Sander Grandia Software Development was established July 1st 2020`
    ];

}

function how() {
    return [
        [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          |  | | | | |`,
                `|     |__________|  |_|  "' |`,
                `|.--'                   '--.|`,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          |  | | | | |`,
                `|     |__.____'__|  |_|  "' |`,
                `|.--'       .           '--.|`,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          |  | | | | |`,
                `|     |__._'_:x__|  |_|  "' |`,
                `|.--'    .  :  '        '--.|`,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |   .   _  |  | | | | |`,
                `|     |_'._'_|x._|  |_|  "' |`,
                `|.--'    :. |  :        '--.|`,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |   +   _  |  | | | | |`,
                `|     |_':\\ _|,:_|  |_|  "' |`,
                `|.--'    |. T--|        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\:\\ _(_> |  |_|  "' |`,
                `|.--'    |:.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\ _(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\ _(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\/_(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |    .     .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |     ?    .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |      .        |  _. |`,
                `|     |   ' ? -  .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\ _(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |   . ?    .--. | | | |`,
                `|     |   o  '_  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |     .    .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\/_(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |    .     .--. | | | |`,
                `|     |   o ' _  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |    .          |  _. |`,
                `|     |   - ! '  .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\/_(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |     .         |  _. |`,
                `|     |  ' !!! - .--. | | | |`,
                `|     |   o ' _  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |  .   '        |  _. |`,
                `|     |    ! ! . .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\ _(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |   . ',   .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |     .    .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\(\\/_(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |     .    .--. | | | |`,
                `|     |   o'  _  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |        ,      |  _. |`,
                `|     |   - GR.  .--. | | | |`,
                `|     |   o'  _  |  | | | | |`,
                `|     |_\\(\\/_(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |  .            |  _. |`,
                `|     | - GRF '  .--. | | | |`,
                `|     |   o'  _  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |  ,  .         |  _. |`,
                `|     | - RFZL - .--. | | | |`,
                `|     |   o' '_  |  | | | | |`,
                `|     |_\\(\\/_(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |   .           |  _. |`,
                `|     | - FZ'-   .--. | | | |`,
                `|     |   o'  _  |  | | | | |`,
                `|     |_\\(\\._(_> |  |_|  "' |`,
                `|.--'    |\\.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |  - .'    .--. | | | |`,
                `|     |   o   _  |  | | | | |`,
                `|     |_\\<|\\_(_> |  |_|  "' |`,
                `|.--'    |>.T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |  '   .   .--. | | | |`,
                `|     |    o  _  |  | | | | |`,
                `|     |_\\_< \\(_> |  |_|  "' |`,
                `|.--'    | |T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |     o _  |  | | | | |`,
                `|     |_\\_ (\\(_> |  |_|  "' |`,
                `|.--'    |/|T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |     o_   |  | | | | |`,
                `|     |_\\_ ((_>  |  |_|  "' |`,
                `|.--'    |/|T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |    o_    |  | | | | |`,
                `|     |_\\_<(_>   |  |_|  "' |`,
                `|.--'    |/|T  T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |    o_    |  | | | | |`,
                `|     |_\\_ (_>   |  |_|  "' |`,
                `|.--'    | |\\--T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |     o_   |  | | | | |`,
                `|     |_\\_  (_>  |  |_|  "' |`,
                `|.--'    | />--T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |      o_  |  | | | | |`,
                `|     |_\\_  <(_> |  |_|  "' |`,
                `|.--'    |  /| T        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |       o_ |  | | | | |`,
                `|     |_\\_ _ <(_>|  |_|  "' |`,
                `|.--'    |  T |\\        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |        o_|  | | | | |`,
                `|     |_\\_ ___ (_>  |_|  "' |`,
                `|.--'    |  T .|        '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |         o_  | | | | |`,
                `|     |_\\_ ____ (_> |_|  "' |`,
                `|.--'    |  T--/|       '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o_ | | | | |`,
                `|     |_\\_ _____ (_>|_|  "' |`,
                `|.--'    |  T  T.>      '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o_ | | | | |`,
                `|     |_\\_ _____<(_>|_|  "' |`,
                `|.--'    |  T  T >>     '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o _  | | | |`,
                `|     |_\\_ _____ \\(_>_|  "' |`,
                `|.--'    |  T  T >>     '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--_ | | | |`,
                `|     |          o (_>| | | |`,
                `|     |_\\_ _____ |-  _|  "' |`,
                `|.--'    |  T  T >>     '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |              _   _. |`,
                `|     |          .- (_> | | |`,
                `|     |          o_.    | | |`,
                `|     |_\\_ _____ |  |_|  "' |`,
                `|.--'    |  T  T >>     '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               _  _. |`,
                `|     |          .-- (_>| | |`,
                `|     |          o      | | |`,
                `|     |_\\_ _____ |\\ |_|  "' |`,
                `|.--'    |  T  T |>     '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |                _ _. |`,
                `|     |          .--. (_> | |`,
                `|     |          o  |   | | |`,
                `|     |_\\_ _____ <  |_|  "' |`,
                `|.--'    |  T  T |.     '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--.   _ | |`,
                `|     |          o  |  (_>| |`,
                `|     |_\\_ _____< > |_|  "' |`,
                `|.--'    |  T  T |      '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | |_| |`,
                `|     |          o  | | ( | |`,
                `|     |_\\_ _____< > |_|  "' |`,
                `|.--'    |  T  T |      '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o  | | |(| |`,
                `|     |_\\_ _____< > |_|  "' |`,
                `|.--'    |  T  T |      '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o  | | | | |`,
                `|     |_\\_ _____< > |_|  "' |`,
                `|.--'    |  T  T |      '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o  | | | | |>`,
                `|     |_\\_ _____< > |_|  "' |`,
                `|.--'    |  T  T |      '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o  | | | | |_`,
                `|     |_\\_ _____< > |_|  "' |_>`,
                `|.--'    |  T  T |      '--.|`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o  | | | | |`,
                `|     |_\\_ _____< > |_|  "' |'_. `,
                `|.--'    |  T  T |      '--.| _>-`,

            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o  | | | | | .`,
                `|     |_\\_ _____< > |_|  "' |'+/.-`,
                `|.--'    |  T  T |      '--.|*R '`,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o  | | | | | ' .`,
                `|     |_\\_ _____< > |_|  "' |`,
                `|.--'    |  T  T |      '--.|.x, .`,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o  | | | | |    .`,
                `|     |_\\_ _____< > |_|  "' |`,
                `|.--'    |  T  T |      '--.|.x, `,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o  | | | | |`,
                `|     |_\\_ _____< > |_|  "' |`,
                `|.--'    |  T  T |      '--.|.x, `,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o  | | | | |`,
                `|     |_\\_ _ __ < > |_|  "' |`,
                `|.--'    :  |  | :      '--.|.x, `,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          o  | | | | |`,
                `|     |___ _ ___  . |_|  "' |`,
                `|.--'    .  :  | '      '--.|.-. `,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          .  | | | | |`,
                `|     |_____ ____ . |_|  "' |`,
                `|.--'    .  . ':        '--.| .`,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          |  | | | | |`,
                `|     |__________ . |_|  "' |`,
                `|.--'          .        '--.|`,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          |  | | | | |`,
                `|     |__________|  |_|  "' |`,
                `|.--'          .        '--.|`,
            ],
        ], [
            [
                ` `,
                `|'"-. _________________ .-"'|`,
                `|     |- a:f -        |     |`,
                `|     |               |  _. |`,
                `|     |          .--. | | | |`,
                `|     |          |  | | | | |`,
                `|     |__________|  |_|  "' |`,
                `|.--'                   '--.|`,
            ],
        ]
    ];
}

function help() {
    let defaultCommands = Object.keys(Terminal.defaultCommandMapping);
    let allCommands = defaultCommands.concat(customCommands);

    let helpMessage = [
        `The following commands are available:`
    ];

    allCommands.forEach((command) => {
        command = `    - ` + command;
        helpMessage.push(command);
    });

    return helpMessage;
}

function exit() {
    window.location.href = '../';

    return [`logging out...`];
}

init();
