const puppeteer = require("puppeteer");

let page;
let browser;
const users = ["wendy-harrigan-0a30595"];

const sleep = (milliseconds) => {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
};
const GetProperty = async (element, property) => {
    return await (await element.getProperty(property)).jsonValue();
};
const init = async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("https://linkedin.com");
    await page.type("#session_key", "dimitripezaris@gmail.com");
    await page.type("#session_password", "nsass28b");
    await page.click(".sign-in-form__submit-button");
    sleep(3000);
};
const toUser = async (id) => {
    await page.goto(`https://linkedin.com/in/${id}/`);
    sleep(3000);
};

const getOccupation = async () => {
    const occupationElement = await page.$("div.text-body-medium");
    const occupation = await (
        await occupationElement.getProperty("textContent")
    ).jsonValue();
    return occupation.substring(7).slice(0, -5);
};

const getAbout = async () => {
    const aboutElement = await page.$("div.inline-show-more-text > span");
    return await (await aboutElement.getProperty("textContent")).jsonValue();
};
const getEducation = async () => {
    const education = [];
    const buttons = await page.$$(".artdeco-button--fluid");
    let educationButton = -1;
    await Promise.all(
        buttons.map(async (button, index) => {
            if (
                (
                    await button.$eval("span", (elem) => {
                        return elem.innerText;
                    })
                ).match(/Show all \d education/)
            ) {
                educationButton = index;
            }
        })
    );
    if (educationButton != -1) {
        await buttons[educationButton].click();
        sleep(1500);
        const educationBlocks = await page.$$("li.pvs-list__paged-list-item");
        await Promise.all(
            educationBlocks.map(async (block) => {
                const title = await block.$eval(
                    "div > div.align-self-center > div.justify-space-between > a > div > span > span.visually-hidden",
                    (elem) => elem.innerText
                );
                const info = await block.$eval(
                    "div > div.align-self-center > div.justify-space-between > a > span > span.visually-hidden",
                    (elem) => elem.innerText
                );
                education.push({
                    school: title,
                    major: info,
                });
            })
        );
        await page.goBack();
    } else {
        let educationBlocks = await page.$$("section.ember-view");
        let educationBlock;

        await Promise.all(
            educationBlocks.map(async (block, index) => {
                let header = "";
                try {
                    header = await block.$eval(
                        "div.pvs-header__container > div.pvs-header__top-container--no-stack > div > div > h2 > span.visually-hidden",
                        (elem) => {
                            return elem.innerText;
                        }
                    );
                } catch {}
                if (header == "Education") {
                    educationBlock = index;
                }
            })
        );
        const temp = await educationBlocks[educationBlock].$(
            "div.pvs-list__outer-container > ul"
        );
        educationBlocks = await temp.$$("li");
        console.log("made it");
        await Promise.all(
            educationBlocks.map(async (block) => {
                let info;
                let title;
                try {
                    title = await block.$eval(
                        "div.pvs-list__item--no-padding-when-nested > div.align-self-center > div.justify-space-between > a > div.align-items-center > span > span.visually-hidden",
                        (elem) => elem.innerText
                    );
                } catch {
                    title = "";
                }

                try {
                    info = await block.$eval(
                        "a > span > span.visually-hidden",
                        (elem) => elem.innerText
                    );
                } catch {
                    info = "";
                }
                education.push({
                    school: title,
                    major: info,
                });
            })
        );
    }

    return education;
};
const getExperience = async () => {
    const experience = [];
    const buttons = await page.$$(".artdeco-button--fluid");
    let experienceButton = -1;
    await Promise.all(
        buttons.map(async (button, index) => {
            if (
                (
                    await button.$eval("span", (elem) => {
                        return elem.innerText;
                    })
                ).match(/Show all \d experiences/)
            ) {
                experienceButton = index;
            }
        })
    );
    if (experienceButton != -1) {
        await buttons[experienceButton].click();
        sleep(1500);

        const companyBlocks = await page.$$("li.pvs-list__paged-list-item");
        await Promise.all(
            companyBlocks.map(async (block) => {
                const title = await block.$eval(
                    "div > div.align-self-center > div.display-flex > div.display-flex > div.align-items-center > span > span.visually-hidden",
                    (elem) => elem.innerText
                );
                const company = await block.$eval(
                    "div > div.align-self-center > div.display-flex > div.display-flex > span.t-14 > span.visually-hidden",
                    (elem) => elem.innerText
                );
                const duration = await block.$eval(
                    "div > div.align-self-center > div.display-flex > div.display-flex > span.t-black--light > span.visually-hidden",
                    (elem) => elem.innerText
                );
                experience.push({
                    company: company,
                    title: title,
                    duration: duration,
                });
            })
        );
        await page.goBack();
    } else {
        let experienceBlocks = await page.$$("section.ember-view");
        let experienceBock;

        await Promise.all(
            experienceBlocks.map(async (block, index) => {
                let header = "";
                try {
                    header = await block.$eval(
                        "div.pvs-header__container > div.pvs-header__top-container--no-stack > div > div > h2 > span.visually-hidden",
                        (elem) => {
                            return elem.innerText;
                        }
                    );
                } catch {}
                if (header == "Experience") {
                    experienceBock = index;
                }
            })
        );
        const temp = await experienceBlocks[experienceBock].$(
            "div.pvs-list__outer-container > ul"
        );
        experienceBlocks = await temp.$$("li");
        await Promise.all(
            experienceBlocks.map(async (block) => {
                let company;
                let duration;
                let title;
                try {
                    title = await block.$eval(
                        "div.pvs-list__item--no-padding-when-nested > div.align-self-center > div.justify-space-between > div.display-flex > div.align-items-center > span.mr1 > span.visually-hidden",
                        (elem) => elem.innerText
                    );
                    company = await block.$eval(
                        "div.pvs-list__item--no-padding-when-nested > div.align-self-center > div.justify-space-between > div.full-width > span.t-14 > span.visually-hidden",
                        (elem) => elem.innerText
                    );
                    duration = await block.$eval(
                        "div.pvs-list__item--no-padding-when-nested > div.align-self-center > div.justify-space-between > div.full-width > span.t-black--light > span.visually-hidden",
                        (elem) => elem.innerText
                    );
                    experience.push({
                        company: company,
                        title: title,
                        duration: duration,
                    });
                } catch {}
            })
        );
    }

    return experience;
};
const getSkills = async () => {
    const skills = [];
    const buttons = await page.$$(".artdeco-button--fluid");
    let skillsButton = -1;
    await page.screenshot({ path: "screenshot.png" });
    await Promise.all(
        buttons.map(async (button, index) => {
            if (
                (
                    await button.$eval("span", (elem) => {
                        return elem.innerText;
                    })
                ).match(/Show all [0-9]+ skills/)
            ) {
                skillsButton = index;
            }
        })
    );
    if (skillsButton != -1) {
        await buttons[skillsButton].click();
        sleep(1500);
        const skillBlocks = await page.$$("li.pvs-list__paged-list-item");
        await Promise.all(
            skillBlocks.map(async (block) => {
                let skill;
                try {
                    skill = await block.$eval(
                        "div > div.align-self-center > div.justify-space-between > a > div > span.t-bold > span.visually-hidden",
                        (elem) => elem.innerText
                    );
                    skills.push(skill);
                } catch {}
                try {
                    skill = await block.$eval(
                        "div > div.align-self-center > div.justify-space-between > div.display-flex > div > span > span.visually-hidden",
                        (elem) => elem.innerText
                    );
                    skills.push(skill);
                } catch {
                    skill = "";
                }
            })
        );
    } else {
        let skillsBlocks = await page.$$("section.ember-view");
        let skillsBlock;

        await Promise.all(
            skillsBlocks.map(async (block, index) => {
                let header = "";
                try {
                    header = await block.$eval(
                        "div.pvs-header__container > div.pvs-header__top-container--no-stack > div > div > h2 > span.visually-hidden",
                        (elem) => {
                            return elem.innerText;
                        }
                    );
                } catch {}
                if (header == "Skills") {
                    skillsBlock = index;
                }
            })
        );
        const temp = await skillsBlocks[skillsBlock].$(
            "div.pvs-list__outer-container > ul"
        );
        skillsBlocks = await temp.$$("li");
        await Promise.all(
            skillsBlocks.map(async (block) => {
                let skill;
                try {
                    skill = await block.$eval(
                        "div.pvs-list__item--no-padding-when-nested > div.align-self-center > div.justify-space-between > a.display-flex > div.align-items-center > span.mr1 > span.visually-hidden",
                        (elem) => elem.innerText
                    );
                } catch {}
                skills.push(skill);
            })
        );
    }

    return skills;
};
const tearDown = async () => {
    await browser.close();
};
(async () => {
    await init();
    const userData = await Promise.all(
        users.map(async (user) => {
            await toUser(user);
            return {
                name: user,
                occupation: await getOccupation(),
                about: await getAbout(),
                education: await getEducation(),
                experience: await getExperience(),
                skills: await getSkills(),
            };
        })
    );

    console.log(userData[0]);
    await tearDown();
})();
