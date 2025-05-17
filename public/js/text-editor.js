document.addEventListener('DOMContentLoaded', function() {
  const placeholderText = document.getElementById('summernote').getAttribute('data-placeholder');
  const textHeight = document.getElementById('summernote').getAttribute('data-height');

  $('#summernote').summernote({ 
    placeholder: placeholderText, 
    tabsize: 2,
    height: textHeight
  });

  $('#summernote').summernote({
    styleTags: false,
    disableDragAndDrop: true,
    cleaner: {
      action: 'both',
      keepHtml: false
    }
  });
}); 