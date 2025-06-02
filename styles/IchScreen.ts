import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    // flex: 1, // Remove flex: 1 to allow ScrollView to manage its content size
    padding: 20,
    backgroundColor: '#F8F4F0', // Light, calm background
    alignItems: 'center',
    paddingBottom: 40, // Ensure space at the bottom
  },
  title: {
    fontSize: 28, // Slightly larger
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#4A403D', // Dark, earthy tone
    textAlign: 'center',
  },
  // General button styles (can be merged or kept separate)
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginVertical: 8,
    width: '90%', // Make buttons wider
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#6A5ACD', // Spiritual purple
    // Inherits from button, specific overrides here
  },
  ctaButtonText: {
    color: '#FFFFFF',
    // Inherits from buttonText
  },
  logoutButton: {
    backgroundColor: '#FFF0E1', // Light peach/off-white for logout
    borderColor: '#DAA520', // Gold border
    borderWidth: 1,
  },
  logoutButtonText: {
    color: '#DAA520', // Gold text
  },
  deleteButton: {
    backgroundColor: '#FFE4E1', // Light pink/rose for delete
    borderColor: '#DC143C', // Crimson border
    borderWidth: 1,
  },
  deleteButtonText: {
    color: '#DC143C', // Crimson text
  },
  buttonContainer: { // Container for bottom buttons
    marginTop: 30, // Space above the button group
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    color: '#B00020', // Standard error red
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F4F0',
  },
  infoSection: {
    width: '90%',
    paddingVertical: 10,
    paddingHorizontal:15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8A7F7C', // Muted label color
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 17,
    color: '#4A403D',
    fontWeight: '500',
  },
  infoText: { // For messages like "no goals yet"
    fontSize: 15,
    color: '#6B5F5B',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  goalsPreviewContainer: {
    marginTop: 25,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '90%',
    // alignItems: 'center', // Let content align left
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  goalsPreviewTitle: {
    fontSize: 20, // Larger title for goals section
    fontWeight: '600',
    marginBottom: 12,
    color: '#4A403D',
    textAlign: 'center',
  },
  goalItem: {
    paddingVertical: 8,
    borderBottomColor: '#EFEBE8',
    borderBottomWidth: 1,
  },
  goalText: {
    fontSize: 16,
    color: '#5A4D4A',
    lineHeight: 22, // Better readability
  },
  // Removed subtleButton and subtleButtonText as buttons are redesigned
});
