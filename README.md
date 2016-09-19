## Panels

### Background

Google Chrome has become the most popular web browser, surpassing Mozilla Firefox. Chrome is not devoid of its flaws, however. Many people have a hard time working in Chrome, due to Chrome's limited customizability around a user's needs. Enter Panels...

Panels is a Chrome extension that allows users to manage their tabs in an efficient and elegant manner. Users can have their tabs grouped in such a way that they won't run into the problem of having too many tabs open at the same time. Panels will also provide hotkeys that allow for efficient navigation inside of Chrome.  

### Wireframes

![wireframes](https://github.com/appacademy/job-search-curriculum/blob/master/job-search-projects/images/flex-settings.png)

### Functionality & MVP

This chrome extension will:

- [ ] Always show the user the first thirty characters of the name of each tab that they have open,
- [ ] Display the numbering of each tab for easier ctrl+n navigation,
- [ ] Allow quicker navigation among tabs using hotkeys

### Implementation Timeline

**Day 1**: Get started on the infrastructure of the extension, following <a href="https://developer.chrome.com/extensions/getstarted">this guide</a> from Chrome.  By the end of the day, I will have:

- A completed `package.json`
- A completed `manifest.json`
- The ability to display a sidebar with the names of open tabs.

**Day 2**:  Build out core functionality.

- Allow users to navigate using the sidebar using either the mouse or keystrokes
- Get the basic styling done

**Day 3**: Tighten everything done by day 2

- Fine tune the styling.
- Fix any issues that may have arisen during the first two days of work.
- Lay out plans for tackling the bonus, or fixing anything that may yet be deeply broken.

**Day 4**:  Implement tab grouping features.

- Group/nest similar tabs.
- Allow users to split off tab groupings into separate windows if they like.

### Technologies & Technical Challenges

The technologies that will be used for this project are very familiar to the developers beforehand. We will be using HTML 5, CSS3, and Javascript in order to build this Chrome Extension. This is considered to be the basic workflow for building out a Chrome extension.

There will definitely be a lot of planning around how the Chrome extension communicates with the browser. We are going to need to decide what browser and page actions the Chrome extension is going to have. This is one of the most pivotal parts of any Chrome extension.

We will also have to decide if this will be a background or event based page. Given that the Chrome docs have recommended that for performance reasons it is better to create an event page, we will probably stick to this plan. We do acknowledge, however, that we may have some time constraints during this project, so we may have to use the background page in order to reach our minimal viable product.

Lastly, we need to decide what messages our Chrome extension will listen for on the users page. This will mean that we have to look into what Javascript event may occur, and what the Google Chrome Extensions API does in response to them.