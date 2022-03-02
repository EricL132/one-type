import { useCallback, useEffect, useRef, useState } from "react";
import Keyboard from "react-simple-keyboard";
import "./App.css";
import "react-simple-keyboard/build/css/index.css";

let interval;
function App() {
    const [joinedWords, setJoinedWords] = useState([]);
    const [joinedWords2win, setJoinedWords2win] = useState([]);
    const [currSpeed, setCurrSpeed] = useState(0);
    const [currErrors, setCurrErrors] = useState(0);
    const [typedWords, setTypedWords] = useState(0);
    const [actived, setActivated] = useState(false);
    const [currTime, setCurrTime] = useState(0);
    const wordBoxElement = useRef(null);
    const keyboardEle = useRef(null);
    useEffect(() => {
        getWords();
    }, []);
    //Get words from wrod api
    const getWords = () => {
        const numWords = Math.floor(Math.random() * (20 - 10) + 10);
        fetch(`https://random-word-api.herokuapp.com/word?number=${numWords}`)
            .then((res) => res.json())
            .then((data) => {
                const resResult = [];
                data.map((word) => {
                    return resResult.push(word.split(""));
                });
                let joinedWords = resResult.join(",_,").split(",");
                setJoinedWords(joinedWords);
                setJoinedWords2win(joinedWords);
            });
    };

    //Called whenever key is pressed inside input box checks if correct key and continues
    const handleKeyPress = (e) => {
        if (e.key === " ") {
            keyboardEle.current.getButtonElement("{space}").classList.add("keyboard-click");
            setTimeout(
                () =>
                    keyboardEle.current
                        .getButtonElement("{space}")
                        .classList.remove("keyboard-click"),
                100
            );
        }
        if (keyboardEle.current.getButtonElement(e.key)) {
            keyboardEle.current.getButtonElement(e.key).classList.add("keyboard-click");
            setTimeout(
                () =>
                    keyboardEle.current.getButtonElement(e.key).classList.remove("keyboard-click"),
                100
            );
        }
        if (e.key === joinedWords2win[0] || (joinedWords2win[0] === "_" && e.key === " ")) {
            setTypedWords(typedWords + 1);

            const letters = Array.from(document.getElementsByClassName("word-letter"));
            const currLetter = letters.find((child) => !child.classList.contains("typed"));
            currLetter.classList.add("typed");
            setJoinedWords2win(joinedWords2win.slice(1));

            if (joinedWords2win.length === 1) {
                setJoinedWords([]);
                getWords();
                handleLeaveFocus(false);
            }
        } else {
            setCurrErrors(currErrors + 1);
        }
    };

    //Left input box resets everything
    const handleLeaveFocus = (resetSpeed) => {
        const typedletters = Array.from(document.getElementsByClassName("typed"));
        wordBoxElement.current.style.border = "1px solid #3c3c3c";
        setActivated(false);
        typedletters.map((ele) => {
            return (ele.classList = "word-letter");
        });
        setJoinedWords2win(joinedWords.slice(0));

        //If completed current words dont reset timer/speed
        if (resetSpeed !== false) {
            setCurrSpeed(0);
            setCurrErrors(0);
            setTypedWords(0);
            setCurrTime(0);
            clearInterval(interval);
        }
    };
    const updateSpeed = useCallback(() => {
        setCurrSpeed(Math.floor(typedWords / 5 / (currTime / 60)));
    }, [currTime, typedWords]);
    //Reloads element to show new data
    useEffect(() => {
        if (currTime > 0) updateSpeed();
    }, [currTime, updateSpeed]);

    //Update current speed fomula = (totalwords/5) / (totalseconds/60)

    //Start timer called when input box is focused
    const starttimer = (e) => {
        e.target.style.border = "1px solid white";
        setActivated(true);
        interval = setInterval(() => {
            setCurrTime((currTime) => currTime + 1);
        }, 1000);
    };
    const handleNewWords = () => {
        getWords();
        handleLeaveFocus();
    };
    return (
        <div className="typing-con">
            <div className="mid-con">
                <div className="tools-container">
                    <span className="speed-container">Speed (WPM): {currSpeed}</span>
                    <span className="speed-container" style={{ marginLeft: "4rem" }}>
                        Errors: {currErrors}
                    </span>
                    <div className="options-con">
                        <button className="d-button" onClick={handleNewWords}>
                            New words
                        </button>
                    </div>
                </div>
                <div className="Info-container">
                    <div
                        className="words-container"
                        tabIndex="0"
                        onFocus={starttimer}
                        onBlur={handleLeaveFocus}
                        onKeyPress={handleKeyPress}
                        ref={wordBoxElement}
                    >
                        {joinedWords
                            .join("")
                            .split("_")
                            .map((word, i, arr) => {
                                return (
                                    <div key={i}>
                                        {word.split("").map((letter, i) => {
                                            return (
                                                <span key={i} className="word-letter">
                                                    {letter}
                                                </span>
                                            );
                                        })}
                                        {i !== arr.length - 1 && (
                                            <span className="word-letter">_</span>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
            {!actived && <span className="click-activate">Click to activate</span>}
            {window.innerWidth > 1000 && (
                <div className="keyboard">
                    <Keyboard
                        keyboardRef={(r) => (keyboardEle.current = r)}
                        buttonTheme={[
                            {
                                class: "keyboard-no-border-radius",
                                buttons:
                                    " ` 1 2 3 4 5 6 7 8 9 0 - = {bksp} {tab} q w e r t y u i o p [ ] \\ {lock} a s d f g h j k l ; ' {enter} {shift} z x c v b n m , . / {shift} .com @ {space}",
                            },
                        ]}
                        display={{
                            "{bksp}": "Backspace",
                            "{enter}": "Enter",
                            "{shift}": "Shift",
                            "{space}": "Space",
                            "{lock}": "Caps",
                            "{tab}": "Tab",
                            "@": "Alt",
                            ".com": "Ctrl",
                        }}
                    ></Keyboard>
                </div>
            )}
        </div>
    );
}

export default App;
