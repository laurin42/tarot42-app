import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F4F0', // Light, calming background
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#8A7F7C', // Muted text color
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A403D', // Darker, earthy tone
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5F5B', // Slightly lighter earthy tone
    textAlign: 'center',
    marginBottom: 30,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A7F7C', // Muted, earthy button color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 2, // Subtle shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  datePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  selectedDateText: {
    fontSize: 18,
    color: '#4A403D',
    marginBottom: 20,
  },
  iosPickerDoneButton: {
    backgroundColor: '#6A5ACD', // A slightly more vibrant color for confirmation
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10, // Spacing from the picker
    marginBottom: 20,
  },
  iosPickerDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  zodiacContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  zodiacLabel: {
    fontSize: 16,
    color: '#8A7F7C',
    marginBottom: 5,
  },
  zodiacValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A5ACD', // Accent color for the zodiac sign
  },
  optionalLabel: {
    fontSize: 14,
    color: '#8A7F7C',
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    width: '90%',
    height: 45,
    borderColor: '#D3CFCB', // Lighter border color
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  label: { // New style for general labels like "Geschlecht:"
    fontSize: 16,
    color: '#4A403D', // Darker, earthy tone, consistent with title/subtitle
    alignSelf: 'flex-start', // Align to the left
    marginLeft: '5%', // Indent slightly if content is mostly centered
    marginBottom: 8,
    marginTop: 20, // Add some space above the label
  },
  pickerContainer: { // New style for the Picker's container
    width: '90%',
    borderColor: '#D3CFCB',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#FFFFFF', 
    overflow: 'hidden', 
  },
  picker: { 
    width: '100%',
    height: Platform.OS === 'ios' ? 180 : 50, 
    color: '#4A403D', 
    // backgroundColor: '#FFFFFF', 
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 'auto', // Push to bottom
    paddingHorizontal: 10, // Add some horizontal padding
    paddingBottom: 10, // Padding from bottom edge
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120, // Ensure buttons have a decent width
  },
  skipButton: {
    backgroundColor: '#D3CFCB', // Lighter, less prominent color for skip
  },
  nextButton: {
    backgroundColor: '#6A5ACD', // Primary action color
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
