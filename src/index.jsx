import ForgeUI, { render, ContextMenu, Form, SectionMessage, Button, Text, Select, Option, InlineDialog, Radio, TextArea, TextField, Strong, Link, useProductContext, useState, RadioGroup, CheckboxGroup, Checkbox } from '@forge/ui';
import api from '@forge/api';

const key = process.env.KEY;
const token = process.env.TOKEN;
const board = 'Qv2fEeb4';

const fetchProducts = async () => {
  const response = await api.fetch(`https://api.trello.com/1/boards/${board}/lists?key=${key}&token=${token}`);
  return response.json();
};

const App = () => {

  const [cardUrl, setCardUrl] = useState(undefined);
  
  const { extensionContext: { selectedText } } = useProductContext();

  const [ productsRaw ] = useState(fetchProducts);

  var products = productsRaw.reduce(function(result,product) {
      if (product.name!='About this board' && product.name!='ENT Backlog'){
        result.push(product);
      }
      return result;
    },[]);
  
  async function createInsight (formData){
    var cards;
    await api.fetch(
      `https://api.trello.com/1/lists/${formData.productKey}/cards?key=${key}&token=${token}`)
      .then(response => response.json())
      .then(data => cards = data);

    var targetCard = cards.reduce(function(result,card) {
      if (card.cardRole==="board"){
        result.push(card);
      }
      return result;
    },[]);

    console.log(targetCard);

    const splitted = targetCard[0].name.split('/');
    const idBoard = splitted[4];
   
    console.log(idBoard);

    var lists;
    await api.fetch(
      `https://api.trello.com/1/boards/${idBoard}/lists?key=${key}&token=${token}`)
      .then(response => response.json())
      .then(data => lists = data);

    var targetList = lists.reduce(function(result,list) {
      if (list.name==="Cross-Component"){
        result.push(list);
      }
      return result;
    },[]);

    console.log(targetList[0].id)

    var newCard;
    await api.fetch(
      `https://api.trello.com/1/cards?key=${key}&token=${token}&idList=${targetList[0].id}&name=${formData.title}&desc=${formData.description}`, {
        method: 'POST',
      },)
      .then(response => response.json())
      .then(data => newCard = data);

      console.log(newCard.url);
      setCardUrl(newCard.url);
  }
    if (!cardUrl){
    return (
        <InlineDialog>
          <Text>
            <Strong>Create a Customer Insight</Strong>
          </Text>
          <Form submitButtonText="Create insight" onSubmit={createInsight}>
            <Select label="Product" name="productKey" isRequired>
              {products.map(product => {
                return (
                  <Option
                    label={`${product.name}`}
                    value={product.id} />
                )
              })}
            </Select>
            <Select label="Component" name="componentKey">
              <Option
                label='Cross-Component'
                value='Cross-Component' defaultSelected/>
            </Select>
            <TextArea label="Description" name="description" defaultValue={selectedText}/>
            <TextField label="Title" name="title" isRequired/>
          </Form>
        </InlineDialog>
    );
  }else{
    return (
    <InlineDialog>
      <SectionMessage title="Click on the link below to continue editing the insight" appearance="info">
        <Text>
          <Link href={cardUrl} openNewTab>
            {cardUrl}
          </Link>
        </Text>
      </SectionMessage>
    </InlineDialog>
    );
  };
  
};

export const run = render(
    <ContextMenu><App/></ContextMenu>
);
