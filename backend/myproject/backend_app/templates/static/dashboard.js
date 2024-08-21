import { navigateTo } from './router.js';

export function loadPage(app) {
    fetch('static/dashboard.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // check if user is logged in
            const user = localStorage.getItem("user");
            if (user && ! JSON.parse(user).isLoggedIn) {
                navigateTo("/login");
                return;
            }
            const username = JSON.parse(user).name;
            
            // add Html
            app.innerHTML = html;

            // fill in div data
            handleWinLoss(document.getElementById('winLoss'), username);
            handleAverage(document.getElementById('average'), username);
            handleWinningStreak(document.getElementById('winningStreak'), username);
            handleRanking(document.getElementById('ranking'), username);
            handleTournamentsWon(document.getElementById('tournamentsWon'), username);
            handleBestFinish(document.getElementById('bestFinish'), username);
            handlePerformance(document.getElementById('performance'), username);
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
}

async function handleWinLoss(div, username) {
    try {
      const response = await fetch('/winLossRecord' + '?' + username);
      if (!response.ok) {
        throw new Error('Failed to fetch data from /winLoss');
      }
      const data = await response.json();
      div.innerHTML = 
      `<h6>Win Loss Record</h6>
      ${data.wins}<br>
      ${data.losses}
      `
    } catch (error) {
      console.error('Error in handleWinLoss', error);
    }
  }

async function handleAverage(div, username) {
    try {
      const response = await fetch('/average' + '?' + username);
      if (!response.ok) {
        throw new Error('Failed to fetch data from /average');
      }
      const data = await response.json();
      div.innerHTML = 
      `<h6>Average</h6>
      ${data.average}
      `
    } catch (error) {
      console.error('Error in handleAverage:', error);
    }
  }

  async function handleWinningStreak(div, username) {
    try {
      const response = await fetch('/winningStreak' + '?' + username);
      if (!response.ok) {
        throw new Error('Failed to fetch data from /winningStreak');
      }
      const data = await response.json();
      div.innerHTML = 
      `<h6>Winning Streak</h6>
      ${data.streak}
      `
    } catch (error) {
      console.error('Error in handleWinningStreak:', error);
    }
  }

  async function handleRanking(div, username) {
    try {
      const response = await fetch('/ranking' + '?' + username);
      if (!response.ok) {
        throw new Error('Failed to fetch data from /ranking');
      }
      const data = await response.json();
      let j;
      for (let i = 0; i < data.length; i++) {
         if (data[i] == username) {
            j = i;
            break;
        }
      }
      div.innerHTML = '<h6>Ranking</h6>';
      if (j - 1 >= 0)
        div.innerHTML += data[j - 1] + "<br>";
      div.innerHTML += username + "<br>";
      if (j + 1 < data.length)
        div.innerHTML += data[j + 1] + "<br>";
    } catch (error) {
      console.error('Error in handleRanking:', error);
    }
  }

  async function handleTournamentsWon(div, username) {
    try {
      const response = await fetch('/tournamentsWon' + '?' + username);
      if (!response.ok) {
        throw new Error('Failed to fetch data from /tournamentsWon');
      }
      const data = await response.json();
      div.innerHTML = 
      `<h6>Tournaments Won</h6>
      ${data.wins}
      `
    } catch (error) {
      console.error('Error in handleTournamentsWon:', error);
    }
  }

  async function handleBestFinish(div, username) {
    try {
      const response = await fetch('/bestFinish' + '?' + username);
      if (!response.ok) {
        throw new Error('Failed to fetch data from /bestFinish');
      }
      const data = await response.json();
      div.innerHTML = 
      `<h6>Best Finish in a Tournament</h6>
      ${data.rank}
      `
    } catch (error) {
      console.error('Error in handleBestFinish:', error);
    }
  }

  async function handlePerformance(div, username) {
    try {
      const response = await fetch('/gameList' + '?' + username);
      if (!response.ok) {
        throw new Error('Failed to fetch data from /gameList');
      }
      const data = await response.json();
      div.innerHTML = '<h6>Performance over Time</h6>';
      for (const game of data) {
        div.innerHTML += game.date + '<br>';
      }
    } catch (error) {
      console.error('Error in handlePerformance:', error);
    }
  }
