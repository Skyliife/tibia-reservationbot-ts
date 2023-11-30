

class Booking {
    private characterName: string;
    private characterUniqueId : string;
    private date: Date;
    private location: string;
    
  
    constructor(customerName: string, characterUniqueId:string, date: Date, location: string) {
      this.characterName = customerName;
      this.characterUniqueId = characterUniqueId;
      this.date = date;
      this.location = location;
    }
  
    public displayBookingInfo(): string {
      return `Booking for ${this.characterName} with id: ${this.characterUniqueId} on ${this.date.toDateString()} at ${this.location}`;
    }
  }