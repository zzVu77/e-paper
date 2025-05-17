document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.querySelector('.navbar-toggler.second-button');
  const sidebar = document.getElementById('navbarToggleExternalContent10');
  const animatedIcon = document.querySelector('.animated-icon2');

  if (toggleButton && sidebar) {
    toggleButton.addEventListener('click', function() {
      sidebar.classList.toggle('show');
      animatedIcon.classList.toggle('open');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
      if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
        sidebar.classList.remove('show');
        animatedIcon.classList.remove('open');
      }
    });
  }
});