document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email)

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function email_view(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      // return email detail view
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#detail-view').style.display = 'block';

      document.querySelector('#detail-view').innerHTML = `
      <ul>
      <li><strong>From:</strong> ${email.sender}</li>
      <li><strong>To:</strong> ${email.recipients}</li>
      <li><strong>Sent:</strong> ${email.timestamp}</li>
      <li><strong>Subject:</strong> ${email.subject}</li>
      <div class="button-area">
      <button id="archive">Archive</button>
      <button id="reply" class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
      </div>
      <hr>
      <li>${email.body}</li>
      </ul>
      `;

      // archive
      const archive = document.querySelector('#archive');
      archive.innerHTML = email.archived ? "Unarchive" : "Archive";
      archive.className = email.archived ? "btn btn-sm btn-outline-primary" : "btn btn-sm btn-outline-danger";
      archive.addEventListener('click', function () {
        fetch((`/emails/${email.id}`), {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
          .then(() => {
            load_mailbox('archive')
          })
      });

      // read checking
      if (!email.read) {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }

      // reply
      const rply = document.querySelector('#reply');
      rply.addEventListener('click', function () {
        document.querySelector('#compose-view').style.display = 'block';
        document.querySelector('#new-email').style.display = 'none';
        document.querySelector('#compose-form').style.marginTop = '50px';
        document.querySelector('#compose-recipients').value = email.sender;
        let subject = email.subject;
        if (subject.split(' ', 1)[0] != "Re:") {
          subject = "Re:" + email.subject;
        }

        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = '';
      })


    });

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'none';

  // Show the mailbox name kenapa pakai slice karena pada mailbox didepan hanya menampilkan 1 karakter pertama dan gunakan + mailbox.slice itu untuk menampilkan 1 kata utuh namun dihapus pada huruf pertama
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // get email 
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // loops to display emails
      emails.forEach(email => {
        const divEmail = document.createElement('div');
        divEmail.innerHTML = `
        <h6>From: ${email.sender}</h6>
        <h6>${email.subject}</h6>
        <p class="p">${email.timestamp}</p> 
        `;

        // change color
        divEmail.className = email.read ? "read" : "unread";
        // read email
        divEmail.addEventListener('click', () => {
          email_view(email.id);
        });
        document.querySelector('#emails-view').append(divEmail);
      });
    });
}

function send_email(event) {
  event.preventDefault();

  // store data

  const recepients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // send email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recepients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
    });
}


