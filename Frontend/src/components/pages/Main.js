import './Main.css';
import { useEffect, useState } from 'react';


function Main() {

  // Constants : 

    let api_url = "https://esilv.olfsoftware.fr/td5/";


  // UseStates :

    let [id, setId] = useState();
    let [sequence, setSequence] = useState(0);
    let [oldList, setOldList] = useState([]);
    let [myList, setStoredData] = useState([]);
    //let listRef = useRef(null);


  // UseEffects :

    useEffect(() => {
      const newList = localStorage.getItem('sequence')
      if (newList) {
        const sequence = JSON.parse(newList)
        setSequence(sequence)
      }
    }, [])

    useEffect(() => {
      const myId = localStorage.getItem('id')
      if (myId) {
        const theId = JSON.parse(myId)
        setId(theId)
      }
    }, [])

    useEffect(() => {
      const newList = localStorage.getItem('myList')
      if (newList) {
        const myList = JSON.parse(newList)
        setStoredData(myList)
      }
    }, [])

    useEffect(() => {
      const previousList = localStorage.getItem('oldList')
      if (previousList) {
        const list = JSON.parse(previousList)
        setOldList(list)
      }
    }, [])

  
    // Functions :

      // Function that is used to register for the first time and will gave an id and the last list that was on the server:
      async function register () 
      {
        const response = await fetch(api_url + "register");
        const data = await response.json();
        for (let i in data.courses) {
          data.courses[i].produit = data.courses[i].produit.toString().toLowerCase();
        }
        localStorage.setItem('myList', JSON.stringify(data.courses));
        localStorage.setItem('oldList', JSON.stringify(data.courses))
        setId(data.id);
        setSequence(data.sequence);
        setStoredData(data.courses);
        console.log("ID : " + data.id);
        console.log("Sequence : " + data.sequence);
        localStorage.setItem('id', JSON.stringify(data.id));
        localStorage.setItem('sequence', JSON.stringify( data.sequence));
        console.log("myList : " + data);


      }

      // Function that will post your list on the server and return you the last list before yours

      // let changes = [{produit: "pomme", qte: 2}, {produit: "banane", qte: 3"}]



      async function letsSynchronize() 
      {
        let changes = [];
        let products = [];
        let oldProducts = [];

        for (let i in myList) 
        {
          products.push(myList[i].produit);
        }

        for (let i in oldList) 
        {
          oldProducts.push(oldList[i].produit);
        }

        for (let p in products) 
        {
          let inside = oldProducts.indexOf(products[p]);
          let indexInOldList = oldProducts.indexOf(products[p]);
          let indexInMyList = products.indexOf(products[p]);
          if (inside === -1) 
          {
            let newQty = myList[indexInMyList].qte.toString();
            changes.push({"produit":myList[p].produit,"qte":newQty});
          }
          else if (parseInt(myList[indexInMyList].qte) !== parseInt(oldList[indexInOldList].qte)) 
          {
            let diff = parseInt(myList[indexInMyList].qte) - parseInt(oldList[indexInOldList].qte);

            let modProduct = myList[indexInMyList].produit.toString();
            changes.push({"produit":modProduct,"qte":diff.toString()});
          }
        }

        for (let x in oldProducts) 
        {
          let inside = products.indexOf(oldProducts[x]);
          if (inside === -1 && oldList[x].qte !== "0")
          {
            let newQty = "-" + oldList[x].qte.toString();
            changes.push({"produit":oldList[x].produit,"qte":newQty});
          }
        }

        // changes = JSON.stringify(changes);
        console.log("Changes : " , changes);
        // const test = await changes.json()
        // console.log("test : " , test.chg);
        
        const response = await fetch(api_url + "courses?id=" + id + "&seq=" + sequence.toString());
        const data = await response.json();
        //setSequence(data.sequence);
        //localStorage.setItem('sequence', JSON.stringify( data.sequence));
        console.log("chg : ", data.chg)
        for (let i in data.chg)
        {
          changes.push(data.chg[i]);
        }
        console.log("changes : ", changes)

        fetch('https://esilv.olfsoftware.fr/td5/courses',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: 'id=' + id + '&chg=' + JSON.stringify(changes)
        }).then((reponse) => 
          {
            if (reponse.ok) 
            {
                  reponse.json().then((json) => {console.log(json);})
            }
          }).catch(error => {alert(error)});
       }


      // Function that modify your list locally
      function gSubmit(e,nomValue, quantiteValue) 
      {
        e.preventDefault();
        let alreadyIn = 0;
      
        for (const i in myList)  
        {
          if (myList[i].produit.toString().toLowerCase() === nomValue.toString().toLowerCase()) 
          {
            if (quantiteValue === "0" || quantiteValue === "")
            {
              myList.splice(i, 1);
            }
            else 
            {
              myList[i].qte = quantiteValue;
            }
            alreadyIn = 1;
          }
        }
     
        setStoredData([...myList]);
    
        if (alreadyIn === 0)
        {
          if (quantiteValue === "" || quantiteValue === "0")
          {
            window.alert("Quantité nulle, le produit n'a pas été ajouté");
          }
          else
          {
            myList.push({produit: nomValue.toString().toLowerCase(), qte: quantiteValue});
            setStoredData([...myList]);
          }
        }
        // localStorage.setItem('myList', JSON.stringify(myList));
        // window.scrollTo( {
        //   top : listRef.offsetTop,
        //   left : 0,
        //   behavior : 'smooth'
        // })
      }
    

      // Function that will delete the entire list
      function gDeleteAll(e) 
      {
        e.preventDefault();
        setStoredData([]);
        console.log(myList);
      }


      // Function that will but the value and the quantity of the product you clicked on in the inputs
      function selectProduct(product) 
      {
        document.getElementById("Nom").value = product.produit;
        document.getElementById("Quantite").value = product.qte;
      }


      // Function that will delete a product
      function gDelete(e,product) 
      {
        e.preventDefault();
        let allProducts = [];
        for (let i in myList) {
          allProducts.push(myList[i].produit);
        }
        let index = allProducts.indexOf(product);
        myList.splice(index, 1);
        setStoredData([...myList]);
        localStorage.setItem('myList', JSON.stringify(myList));
      }


       //           < a ref={listRef}> </a>



    return (

      <div className="MainContainer">
        <div className="Header">
        <p className= "Title">Create or modify a shopping list : </p>
        </div>
        <div className="Corpus">
          <div> 
            <span className="Title" id="connexion"> First connexion : </span>
            <button onClick={register} id="register">Register</button>


          </div>
          <div className="input-container">
            <label className='input-label'> Your id </label>
            <span className='id'> {id} </span> <br/>
            <label className='input-label'> Last sequence synchronized </label>
            <span className='id'> {sequence} </span>
          </div>

        </div>


  

        <div> 
          <p className="Title">Your shopping list :</p>
        </div>
        <div className="input-container">
          <form>
            <label className="input-label">Product</label>
            <input type="text" id="Nom" className="input-field" onKeyDown={(a) => {if (a.key === "Enter") {gSubmit(document.getElementById("Nom").value, document.getElementById("Quantite").value)}}} />
            <label className="input-label">Quantity</label>
            <input type="number" id="Quantite" className="input-field" placeholder='0' onKeyDown={(a) => { if (a.key === "Enter") {gSubmit(document.getElementById("Nom").value, document.getElementById("Quantite").value)}}} />
            
            <button className="modify-button" type="submit" id="add" onClick={(e) => gSubmit(e,document.getElementById("Nom").value, document.getElementById("Quantite").value)}>Add / Modify</button> 
            <button className="modify-button" id="delete" onClick={(e) => {if (window.confirm("Are you sure you want to delete this product ?")) {gDelete(e,document.getElementById("Nom").value);}}}>Delete Product</button>
          </form>

          
          <div>
            <button onClick={(e) => { if (window.confirm("Are you sure you want to delete the list ?")) {gDeleteAll(e);}}} >Delete list</button>
          </div>


        </div>
    


        <div className="list-container">
          {
            myList.map((item, index) => 
            (<button onClick={() => selectProduct(item)} className="list-item" key={index}>
            {item.produit} : {item.qte}</button>)
            )
          }
        </div>

        <div> 
          <button onClick={letsSynchronize} > Synchronize </button>
        </div>


 
          <div>
            <div className="Title">
              Last shopping list recuperated : 
            </div>
            <div className="list-container"> 
              {
                oldList.map((item, index) => (
                <span className="list-item" key={index}>
                  {item.produit} : {item.qte}
                </span>))
              }
            </div>
          </div>

            

      </div>
    );
  }

export default Main;