const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector('[name=productId').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf').value;

  const productCard = btn.closest('article.card.product-item');

  fetch(`/admin/product/${prodId}`, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then((result) => result.json())
    .then((data) => {
      productCard.remove();
    })
    .catch((err) => console.log(err));
};
