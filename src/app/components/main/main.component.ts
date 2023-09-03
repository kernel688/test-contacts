import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, delay, filter, takeUntil, tap } from 'rxjs';
import { differenceInYears } from 'date-fns'

interface Contact {
  id: number
  name: string
  phone: string
  dob: string
  address: string
  email: string
}

const contactsAPI = [
  {
    id: 1693702309047,
    name: 'Juan Martinez',
    phone: '3003124341',
    dob: '1988-06-25T05:00:00.000Z',
    address: 'Carrera 7 24 12',
    email: 'jcmartinezcano@gmail.com',
  },
  {
    id: 1693702394006,
    name: 'Tatiana Jimenez',
    phone: '3104568945',
    dob: '2001-07-30T05:00:00.000Z',
    address: 'Calle 1 13 24',
    email: 'tatiana@gmail.com',
  },
  {
    id: 1693702454128,
    name: 'Mariano Ospina',
    phone: '3145698413',
    dob: '1961-03-16T05:00:00.000Z',
    address: 'Calle 127 89 11',
    email: '',
  },
  {
    id: 1693702516620,
    name: 'Margarita Rosas',
    phone: '',
    dob: '1967-03-09T05:00:00.000Z',
    address: 'Carrera 98 127 60',
    email: 'marianita@gmail.com',
  },
];

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  loading = 0
  contactState: 'edit' | 'add' | 'view' | 'none' = 'none'
  currentContact: Contact | null = null
  currentContactIndex = 0

  
  contacts: Contact[] = []
  contactsFiltered: Contact[] = []
  contactsFilter: FormControl = new FormControl('');
  contactsLoading = false

  _onDestroy = new Subject<void>();

  contactForm = new FormGroup({
    contactId: new FormControl(0),
    contactName: new FormControl('', [Validators.required]),
    contactPhone: new FormControl(''),
    contactDob: new FormControl('', [Validators.required]),
    contactAddress: new FormControl(''),
    contactEmail: new FormControl('',[Validators.email]),
  })



  /////////////// lifecycle ///////////////
  constructor() {
  }

  ngOnInit(): void {
    this.contactsFilter.valueChanges
      .pipe(
        // filter(search => !!search),
        tap(() => (this.contactsLoading = true)),
        takeUntil(this._onDestroy),
        debounceTime(200),
        delay(500),
        takeUntil(this._onDestroy)
      )
      .subscribe({
        next: (result: string) => {
          this.contactsLoading = false;
          this.filterContacts(result);
        },
      });
    
    this.getContacts()
  }
  
  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }



  /////////////// functions ///////////////
  getContacts() {
    this.loading++
    setTimeout(() => {
      this.contacts = contactsAPI
      this.contactsFiltered = this.contacts
      this.loading--
    }, 1000)
  }

  filterContacts(filterInput: string) {
    if (!!filterInput) {

      let lowerCaseFilterInput = filterInput.toLowerCase()
      this.contactsFiltered = []

      let filterName = this.contacts.filter(x => x.name.toLowerCase().includes(lowerCaseFilterInput))
      filterName.forEach(name => {
        let index = this.contactsFiltered.findIndex(contact => contact.id === name.id)
        if(index === -1) { this.contactsFiltered.push(name) }
      })

      let filterPhone = this.contacts.filter(x => x.phone.toLowerCase().includes(lowerCaseFilterInput))
      filterPhone.forEach(phone => {
        let index = this.contactsFiltered.findIndex(contact => contact.id === phone.id)
        if(index === -1) { this.contactsFiltered.push(phone) }
      })

      let filterEmail = this.contacts.filter(x => x.email.toLowerCase().includes(lowerCaseFilterInput))
      filterEmail.forEach(email => {
        let index = this.contactsFiltered.findIndex(contact => contact.id === email.id)
        if(index === -1) { this.contactsFiltered.push(email) }
      })
    } else {
      this.contactsFiltered = this.contacts
    }
  }

  viewContact(contact: Contact) {
    this.currentContact = contact
    this.currentContactIndex = this.contacts.findIndex(contact => contact.id == this.currentContact?.id)
    this.contactForm.controls.contactId.setValue(contact.id)
    this.contactForm.controls.contactName.setValue(contact.name)
    this.contactForm.controls.contactPhone.setValue(contact.phone)
    this.contactForm.controls.contactDob.setValue(contact.dob)
    this.contactForm.controls.contactAddress.setValue(contact.address)
    this.contactForm.controls.contactEmail.setValue(contact.email)
    this.contactState = 'view'
  }

  closeContact() {
    this.contactForm.reset()
    this.currentContact = null
    this.currentContactIndex = 0
    this.contactState = 'none'
  }

  editContact() {
    this.contactState = 'edit'
  }

  cancelEditContact() {
    this.viewContact(this.currentContact as Contact)
  }

  saveEditContact() {
    this.contacts[this.currentContactIndex].name = this.contactForm.controls.contactName.value || ''
    this.contacts[this.currentContactIndex].phone = this.contactForm.controls.contactPhone.value || ''
    this.contacts[this.currentContactIndex].dob = this.contactForm.controls.contactDob.value || ''
    this.contacts[this.currentContactIndex].address = this.contactForm.controls.contactAddress.value || ''
    this.contacts[this.currentContactIndex].email = this.contactForm.controls.contactEmail.value || ''
    this.contactsFiltered = this.contacts
    this.viewContact(this.contacts[this.currentContactIndex])
    this.closeContact()
  }

  deleteContact() {
    this.contacts.splice(this.currentContactIndex,1)
    this.contactsFiltered = this.contacts
    this.closeContact()
  }

  addContact() {
    this.contactState = 'add'
  }

  saveAddContact() {
    let newContact: Contact = {
      id: new Date().getTime(),
      name: this.contactForm.controls.contactName.value || '',
      phone: this.contactForm.controls.contactPhone.value || '',
      dob: this.contactForm.controls.contactDob.value || '',
      address: this.contactForm.controls.contactAddress.value || '',
      email: this.contactForm.controls.contactEmail.value || '',
    }
    this.loading++
    setTimeout(() => {
      this.contacts.push(newContact)
      this.contactsFiltered = this.contacts
      this.loading--
      this.closeContact()
      console.log(this.contacts);
      
    }, 1000)
  }

  getContactAge() {
    let contactDob = new Date(this.contactForm.controls.contactDob.value as string)
    return differenceInYears((new Date()), contactDob)
  }

}