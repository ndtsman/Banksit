'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-08-06T17:01:17.194Z',
    '2023-08-10T23:36:17.929Z',
    '2023-08-11T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2023-07-05T16:33:06.386Z',
    '2023-08-05T14:43:26.374Z',
    '2023-08-10T18:49:59.371Z',
    '2023-08-11T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const containerMovementsDate = document.querySelector('.movements__date');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//functions

//put as an outside function
const formatDate = (date, locale) => {
  // console.log(date);
  const calcDaysPassed = (date1, date2) =>
    //must round to get correct
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  //here can pass the second variable directly in a formated new date() style
  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);
  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7 && daysPassed > 1) return `${daysPassed} days ago`;
  else {
    //need to call: ie. getdate()
    // const day = String(date.getDate()).padStart(2, 0);
    // const month = String(date.getMonth() + 1).padStart(2, 0);
    // const year = String(date.getFullYear()).padStart(2, 0);

    // return `${day}/${month}/${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
  }
  // const newDate = new Date(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: `currency`,
    currency: currency,
  }).format(value);
};

const disPlayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  // console.log(movement);

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    //must pass in formated date not acc.movementsDates[i]directly
    const date = new Date(acc.movementsDates[i]);

    //one variable is easier
    const displayDate = formatDate(date, acc.locale);
    // console.log(displayDate);
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
    <div class='movements__row'>
      <div class='movements__type movements__type--${type}'>${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
      <div class='movements__value'>${formattedMov}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acu, mov) => acu + mov, 0);
  // acc.balance=balance
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const allIn = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acu, cur) => acu + cur, 0);
  labelSumIn.textContent = formatCur(allIn, acc.locale, acc.currency);

  const allOut = Math.abs(
    acc.movements.filter((mov) => mov < 0).reduce((acu, cur) => acu + cur, 0)
  );
  labelSumOut.textContent = formatCur(allOut, acc.locale, acc.currency);

  // console.log(Math.abs(allOut));
  const allInterest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int) => int > 1)
    .reduce((acu, cur) => acu + cur, 0);
  labelSumInterest.textContent = formatCur(
    allInterest,
    acc.locale,
    acc.currency
  );
};

const createUserName = function (accounts) {
  accounts.forEach(function (acc) {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map((name) => name[0])
      .join('');
    // console.log(acc);
  });
};
createUserName(accounts);

let currentAccount;

const updateUI = function (acc) {
  //display movements
  disPlayMovements(acc);

  //display balance
  calcDisplayBalance(acc);
  //display summary
  calcDisplaySummary(acc);
};

//Fake always log in
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;

// updateUI(currentAccount);

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  // console.log('login');

  currentAccount = accounts.find(
    (acc) => acc.userName === inputLoginUsername.value
  );
  // console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //display ui and welcome
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    containerApp.style.opacity = 100;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    //create current date and time
    // const newDate = new Date();
    // const year = String(newDate.getFullYear()).padStart(2, 0);
    // const month = String(newDate.getMonth() + 1).padStart(2, 0);
    // const date = String(newDate.getDate()).padStart(2, 0);
    // const hour = `${newDate.getHours()}`.padStart(2, 0);
    // const minutes = `${newDate.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${date}/${month}/${year}, ${hour}:${minutes}`;

    //clear fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.userName === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.userName !== currentAccount.userName
  ) {
    // DOing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    //update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(Number(inputLoanAmount.value));

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    //Add movement
    currentAccount.movements.push(amount);

    //Add loan date
    currentAccount.movementsDates.push(new Date().toISOString());

    //updateUi
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  console.log('close');
  if (
    inputCloseUsername.value === currentAccount.userName &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.userName === currentAccount.userName
    );

    //delete account
    accounts.splice(index, 1);
    //hide ui
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = '';
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  // console.log(3);
  disPlayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
